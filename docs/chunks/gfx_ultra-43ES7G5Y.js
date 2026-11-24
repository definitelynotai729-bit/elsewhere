import{$ as nt,B,C as it,D as at,E as ot,P as H,S as Be,T as G,V as U,Va as ut,Y as z,a as Ke,b as Qe,e as O,h as $e,i as de,ia as q,j as he,ja as Z,k as Fe,ka as st,l as ke,la as rt,m as He,n as je,na as lt,o as Je,pb as Me,q as W,qa as ct,qb as dt,rb as ht,sb as ft,t as We,tb as pt,ub as mt,vb as vt,wb as gt,xa as Y,y as et,yb as Ge,z as tt}from"./chunk-HVCVHTKO.js";import"./chunk-MR2SPORM.js";var fe={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new H},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new z},cameraProjectionMatrixInverse:{value:new z},cameraWorldMatrix:{value:new z},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new U(-1,-1,-1)},sceneBoxMax:{value:new U(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {  
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {   
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {
				
				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w); 
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));
				
				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));
				
				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);	

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}		

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);		
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},pe={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Pe={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function xt(l=5){let e=Math.floor(l)%2===0?Math.floor(l)+1:Math.floor(l),t=Ct(e),a=t.length,i=new Uint8Array(a*4);for(let c=0;c<a;++c){let d=t[c],v=2*Math.PI*d/a,f=new U(Math.cos(v),Math.sin(v),0).normalize();i[c*4]=(f.x*.5+.5)*255,i[c*4+1]=(f.y*.5+.5)*255,i[c*4+2]=127,i[c*4+3]=255}let s=new Y(i,e,e);return s.wrapS=W,s.wrapT=W,s.needsUpdate=!0,s}function Ct(l){let e=Math.floor(l)%2===0?Math.floor(l)+1:Math.floor(l),t=e*e,a=Array(t).fill(0),i=Math.floor(e/2),s=e-1;for(let c=1;c<=t;){if(i===-1&&s===e?(s=e-2,i=0):(s===e&&(s=0),i<0&&(i=e-1)),a[i*e+s]!==0){s-=2,i++;continue}else a[i*e+s]=c++;s++,i--}return a}var me={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:qe(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new H},cameraProjectionMatrixInverse:{value:new z},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}
		
		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
			
			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
			denoised += w * neighborColor;
			totalWeight += w;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function qe(l,e,t){let a=At(l,e,t),i="vec3[SAMPLES](";for(let s=0;s<l;s++){let c=a[s];i+=`vec3(${c.x}, ${c.y}, ${c.z})${s<l-1?",":")"}`}return i}function At(l,e,t){let a=[];for(let i=0;i<l;i++){let s=2*Math.PI*e*i/l,c=Math.pow(i/(l-1),t);a.push(new U(Math.cos(s),Math.sin(s),c))}return a}var we=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,t,a){return e[0]*t+e[1]*a}dot3(e,t,a,i){return e[0]*t+e[1]*a+e[2]*i}dot4(e,t,a,i,s){return e[0]*t+e[1]*a+e[2]*i+e[3]*s}noise(e,t){let a,i,s,c=.5*(Math.sqrt(3)-1),d=(e+t)*c,v=Math.floor(e+d),f=Math.floor(t+d),T=(3-Math.sqrt(3))/6,P=(v+f)*T,n=v-P,x=f-P,p=e-n,h=t-x,E,b;p>h?(E=1,b=0):(E=0,b=1);let w=p-E+T,S=h-b+T,M=p-1+2*T,y=h-1+2*T,R=v&255,D=f&255,A=this.perm[R+this.perm[D]]%12,o=this.perm[R+E+this.perm[D+b]]%12,r=this.perm[R+1+this.perm[D+1]]%12,u=.5-p*p-h*h;u<0?a=0:(u*=u,a=u*u*this.dot(this.grad3[A],p,h));let m=.5-w*w-S*S;m<0?i=0:(m*=m,i=m*m*this.dot(this.grad3[o],w,S));let g=.5-M*M-y*y;return g<0?s=0:(g*=g,s=g*g*this.dot(this.grad3[r],M,y)),70*(a+i+s)}noise3d(e,t,a){let i,s,c,d,f=(e+t+a)*.3333333333333333,T=Math.floor(e+f),P=Math.floor(t+f),n=Math.floor(a+f),x=1/6,p=(T+P+n)*x,h=T-p,E=P-p,b=n-p,w=e-h,S=t-E,M=a-b,y,R,D,A,o,r;w>=S?S>=M?(y=1,R=0,D=0,A=1,o=1,r=0):w>=M?(y=1,R=0,D=0,A=1,o=0,r=1):(y=0,R=0,D=1,A=1,o=0,r=1):S<M?(y=0,R=0,D=1,A=0,o=1,r=1):w<M?(y=0,R=1,D=0,A=0,o=1,r=1):(y=0,R=1,D=0,A=1,o=1,r=0);let u=w-y+x,m=S-R+x,g=M-D+x,Q=w-A+2*x,$=S-o+2*x,J=M-r+2*x,ee=w-1+3*x,te=S-1+3*x,C=M-1+3*x,V=T&255,F=P&255,k=n&255,ve=this.perm[V+this.perm[F+this.perm[k]]]%12,ge=this.perm[V+y+this.perm[F+R+this.perm[k+D]]]%12,xe=this.perm[V+A+this.perm[F+o+this.perm[k+r]]]%12,Se=this.perm[V+1+this.perm[F+1+this.perm[k+1]]]%12,_=.6-w*w-S*S-M*M;_<0?i=0:(_*=_,i=_*_*this.dot3(this.grad3[ve],w,S,M));let N=.6-u*u-m*m-g*g;N<0?s=0:(N*=N,s=N*N*this.dot3(this.grad3[ge],u,m,g));let L=.6-Q*Q-$*$-J*J;L<0?c=0:(L*=L,c=L*L*this.dot3(this.grad3[xe],Q,$,J));let I=.6-ee*ee-te*te-C*C;return I<0?d=0:(I*=I,d=I*I*this.dot3(this.grad3[Se],ee,te,C)),32*(i+s+c+d)}noise4d(e,t,a,i){let s=this.grad4,c=this.simplex,d=this.perm,v=(Math.sqrt(5)-1)/4,f=(5-Math.sqrt(5))/20,T,P,n,x,p,h=(e+t+a+i)*v,E=Math.floor(e+h),b=Math.floor(t+h),w=Math.floor(a+h),S=Math.floor(i+h),M=(E+b+w+S)*f,y=E-M,R=b-M,D=w-M,A=S-M,o=e-y,r=t-R,u=a-D,m=i-A,g=o>r?32:0,Q=o>u?16:0,$=r>u?8:0,J=o>m?4:0,ee=r>m?2:0,te=u>m?1:0,C=g+Q+$+J+ee+te,V=c[C][0]>=3?1:0,F=c[C][1]>=3?1:0,k=c[C][2]>=3?1:0,ve=c[C][3]>=3?1:0,ge=c[C][0]>=2?1:0,xe=c[C][1]>=2?1:0,Se=c[C][2]>=2?1:0,_=c[C][3]>=2?1:0,N=c[C][0]>=1?1:0,L=c[C][1]>=1?1:0,I=c[C][2]>=1?1:0,Xe=c[C][3]>=1?1:0,Te=o-V+f,Ee=r-F+f,De=u-k+f,ye=m-ve+f,Re=o-ge+2*f,Ce=r-xe+2*f,Ae=u-Se+2*f,be=m-_+2*f,Ue=o-N+3*f,Oe=r-L+3*f,_e=u-I+3*f,Ne=m-Xe+3*f,Le=o-1+4*f,Ie=r-1+4*f,ze=u-1+4*f,Ve=m-1+4*f,ie=E&255,ae=b&255,oe=w&255,ne=S&255,Tt=d[ie+d[ae+d[oe+d[ne]]]]%32,Et=d[ie+V+d[ae+F+d[oe+k+d[ne+ve]]]]%32,Dt=d[ie+ge+d[ae+xe+d[oe+Se+d[ne+_]]]]%32,yt=d[ie+N+d[ae+L+d[oe+I+d[ne+Xe]]]]%32,Rt=d[ie+1+d[ae+1+d[oe+1+d[ne+1]]]]%32,se=.6-o*o-r*r-u*u-m*m;se<0?T=0:(se*=se,T=se*se*this.dot4(s[Tt],o,r,u,m));let re=.6-Te*Te-Ee*Ee-De*De-ye*ye;re<0?P=0:(re*=re,P=re*re*this.dot4(s[Et],Te,Ee,De,ye));let le=.6-Re*Re-Ce*Ce-Ae*Ae-be*be;le<0?n=0:(le*=le,n=le*le*this.dot4(s[Dt],Re,Ce,Ae,be));let ce=.6-Ue*Ue-Oe*Oe-_e*_e-Ne*Ne;ce<0?x=0:(ce*=ce,x=ce*ce*this.dot4(s[yt],Ue,Oe,_e,Ne));let ue=.6-Le*Le-Ie*Ie-ze*ze-Ve*Ve;return ue<0?p=0:(ue*=ue,p=ue*ue*this.dot4(s[Rt],Le,Ie,ze,Ve)),27*(T+P+n+x+p)}};var X=class l extends dt{constructor(e,t,a,i,s,c,d){super(),this.width=a!==void 0?a:512,this.height=i!==void 0?i:512,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=xt(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new G(this.width,this.height,{type:B}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new Z({defines:Object.assign({},fe.defines),uniforms:q.clone(fe.uniforms),vertexShader:fe.vertexShader,fragmentShader:fe.fragmentShader,blending:O,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new ut,this.normalMaterial.blending=O,this.pdMaterial=new Z({defines:Object.assign({},me.defines),uniforms:q.clone(me.uniforms),vertexShader:me.vertexShader,fragmentShader:me.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new Z({defines:Object.assign({},pe.defines),uniforms:q.clone(pe.uniforms),vertexShader:pe.vertexShader,fragmentShader:pe.fragmentShader,blending:O}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Z({uniforms:q.clone(Me.uniforms),vertexShader:Me.vertexShader,fragmentShader:Me.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:ke,blendDst:he,blendEquation:de,blendSrcAlpha:Fe,blendDstAlpha:he,blendEquationAlpha:de}),this.blendMaterial=new Z({uniforms:q.clone(Pe.uniforms),vertexShader:Pe.vertexShader,fragmentShader:Pe.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:$e,blendSrc:ke,blendDst:he,blendEquation:de,blendSrcAlpha:Fe,blendDstAlpha:he,blendEquationAlpha:de}),this.fsQuad=new ht(null),this.originalClearColor=new nt,this.setGBuffer(s?s.depthTexture:void 0,s?s.normalTexture:void 0),c!==void 0&&this.updateGtaoMaterial(c),d!==void 0&&this.updatePdMaterial(d)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new ct,this.depthTexture.format=ot,this.depthTexture.type=it,this.normalRenderTarget=new G(this.width,this.height,{minFilter:We,magFilter:We,type:B,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let a=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=a,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=a,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=qe(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,a){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case l.OUTPUT.Off:break;case l.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=a.texture,this.copyMaterial.blending=O,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case l.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=O,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case l.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=O,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case l.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case l.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=O,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case l.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=a.texture,this.copyMaterial.blending=O,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(e,t,a,i,s){e.getClearColor(this.originalClearColor);let c=e.getClearAlpha(),d=e.autoClear;e.setRenderTarget(a),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=d,e.setClearColor(this.originalClearColor),e.setClearAlpha(c)}renderOverride(e,t,a,i,s){e.getClearColor(this.originalClearColor);let c=e.getClearAlpha(),d=e.autoClear;e.setRenderTarget(a),e.autoClear=!1,i=t.clearColor||i,s=t.clearAlpha||s,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=d,e.setClearColor(this.originalClearColor),e.setClearAlpha(c)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(a){t.set(a,a.visible),(a.isPoints||a.isLine)&&(a.visible=!1)})}restoreVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(a){let i=t.get(a);a.visible=i}),t.clear()}generateNoise(e=64){let t=new we,a=e*e*4,i=new Uint8Array(a);for(let c=0;c<e;c++)for(let d=0;d<e;d++){let v=c,f=d;i[(c*e+d)*4]=(t.noise(v,f)*.5+.5)*255,i[(c*e+d)*4+1]=(t.noise(v+e,f)*.5+.5)*255,i[(c*e+d)*4+2]=(t.noise(v,f+e)*.5+.5)*255,i[(c*e+d)*4+3]=(t.noise(v+e,f+e)*.5+.5)*255}let s=new Y(i,e,e,at,tt);return s.wrapS=W,s.wrapT=W,s.needsUpdate=!0,s}};X.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var St={tone:"agx",exposure:1,hemi:1,env:1,sunLight:1,sun:2,ao:1.5,aoRadius:2,contrast:1,saturation:1},Mt={hub:{tone:"aces",hemi:.85,sun:2.2,ao:1.3},skyreach:{tone:"agx",hemi:.55,env:1.3,sunLight:1.2,exposure:1.1,sun:1.5,contrast:1.15,saturation:1.2},glowcave:{tone:"aces",aoRadius:2},rush:{tone:"aces",hemi:.75,env:1.3,sun:1.5},circuit:{tone:"aces"},clash:{tone:"aces",hemi:.8,env:1.2}},bt=`
#if defined( SHADOWMAP_TYPE_PCF )
	#define PCSS_BLOCKER_SAMPLES 16
	#define PCSS_FILTER_SAMPLES 32
	float pcssNoise( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 pcssDisk( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float t = float( i ) * 2.39996323 + phi;
		return vec2( cos( t ), sin( t ) ) * r;
	}
	float pcssShadow( sampler2D map, vec2 mapSize, float growth, vec3 c ) {
		vec2 texel = 1.0 / mapSize;
		float phi = pcssNoise( gl_FragCoord.xy ) * 6.28318530;
		// 1. the average depth of what blocks the light, searched over the widest penumbra this point could have
		float search = clamp( growth * c.z, 3.0, 24.0 );
		float sum = 0.0, n = 0.0;
		for ( int i = 0; i < PCSS_BLOCKER_SAMPLES; i ++ ) {
			float d = unpackRGBAToDepth( texture2D( map, c.xy + pcssDisk( i, PCSS_BLOCKER_SAMPLES, phi ) * search * texel ) );
			if ( d < c.z ) { sum += d; n += 1.0; }
		}
		if ( n == 0.0 ) return 1.0;
		// 2. penumbra width from the blocker-to-receiver distance, then 3. filter over it
		float pen = clamp( ( c.z - sum / n ) * growth, 1.25, 24.0 );
		float lit = 0.0;
		for ( int i = 0; i < PCSS_FILTER_SAMPLES; i ++ ) {
			lit += step( c.z, unpackRGBAToDepth( texture2D( map, c.xy + pcssDisk( i, PCSS_FILTER_SAMPLES, phi + 1.7 ) * pen * texel ) ) );
		}
		return lit / float( PCSS_FILTER_SAMPLES );
	}
#endif
`,Pt=!1;function Ut(){if(Pt)return;let l=lt,e=l.shadowmap_pars_fragment,t=e.indexOf("#if defined( SHADOWMAP_TYPE_PCF )"),a=e.indexOf("#elif defined( SHADOWMAP_TYPE_PCF_SOFT )"),i=e.indexOf("float getShadow(");if(t<0||a<t||i<0||i>t){console.warn("ultra: unexpected shadow shader; PCSS off");return}l.shadowmap_pars_fragment=e.slice(0,i)+bt+`
	`+e.slice(i,t)+`#if defined( SHADOWMAP_TYPE_PCF )
			shadow = pcssShadow( shadowMap, shadowMapSize, shadowRadius, shadowCoord.xyz );
		`+e.slice(a),Pt=!0}var j={tSSAO:{value:null},ssaoInv:{value:null}},Ot=`#include <aomap_fragment>
	{
		float ssao = mix( texture2D( tSSAO, gl_FragCoord.xy * ssaoInv ).r, 1.0, smoothstep( 45.0, 90.0, length( vViewPosition ) ) );
		reflectedLight.indirectDiffuse *= ssao;
		#if defined( STANDARD )
			reflectedLight.indirectSpecular *= computeSpecularOcclusion( saturate( dot( geometryNormal, geometryViewDir ) ), ssao, material.roughness );
		#endif
	}`,K={tPlanar:{value:null},planarMatrix:{value:null},planarY:{value:0},planarMaxLod:{value:6}},_t=`#include <lights_fragment_maps>
	#if defined( RE_IndirectSpecular )
	{
		vec3 nW = inverseTransformDirection( geometryNormal, viewMatrix );
		float onFloor = smoothstep( 0.9, 0.98, nW.y ) * ( 1.0 - smoothstep( 0.05, 0.25, abs( vPlanarWorld.y - planarY ) ) );
		if ( onFloor > 0.0 ) {
			vec4 pc = planarMatrix * vec4( vPlanarWorld, 1.0 );
			vec2 uv = pc.xy / pc.w + nW.xz * 0.04; // the normal map ripples the reflection a little
			float lod = clamp( sqrt( material.roughness ) * planarMaxLod, 0.0, planarMaxLod );
			// clamped: the sun disc in the reflected sky would otherwise glare (its direct highlight is the sun light's job)
			radiance = mix( radiance, min( textureLod( tPlanar, uv, lod ).rgb, vec3( 1.5 ) ), onFloor );
		}
	}
	#endif`,Ze=new Map;function Nt(l,e){let t=(l?"a":"")+(e?"m":"");return Ze.has(t)||Ze.set(t,a=>{l&&(Object.assign(a.uniforms,j),a.fragmentShader=`uniform sampler2D tSSAO;
uniform vec2 ssaoInv;
`+a.fragmentShader.replace("#include <aomap_fragment>",Ot)),e&&(Object.assign(a.uniforms,K),a.vertexShader=`varying vec3 vPlanarWorld;
`+a.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
	vPlanarWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;`),a.fragmentShader=`uniform sampler2D tPlanar;
uniform mat4 planarMatrix;
uniform float planarY, planarMaxLod;
varying vec3 vPlanarWorld;
`+a.fragmentShader.replace("#include <lights_fragment_maps>",_t))}),Ze.get(t)}function Lt(l,e){if(!l||!l.isMeshStandardMaterial||l.transparent)return;let t=l.userData.ew||{},a=!!e.ssao,i=e.mirror||null;if(t.ssao===a&&!!t.mirror==!!i)return;t.mirror&&!i&&(l.roughness=t.rough);let s=t.mirror?t.rough:l.roughness;if(i&&!t.mirror&&(l.roughness=s*(i.rough||1)),!a&&!i){Ye(l);return}l.userData.ew={ssao:a,mirror:i,rough:s},l.onBeforeCompile=Nt(a,!!i),l.customProgramCacheKey=()=>"ew-"+(a?"a":"")+(i?"m":"")+"2",l.needsUpdate=!0}function Ye(l){!l||!l.userData.ew||(l.userData.ew.mirror&&(l.roughness=l.userData.ew.rough),delete l.userData.ew,delete l.onBeforeCompile,delete l.customProgramCacheKey,l.needsUpdate=!0)}var wt=(l,e)=>l.traverse(t=>{t.material&&[].concat(t.material).forEach(e)}),It={uniforms:{tDiffuse:{value:null},tAO:{value:null},showAO:{value:0},vignette:{value:.22},grain:{value:.018},contrast:{value:1},saturation:{value:1},seed:{value:0},aspect:{value:1}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse, tAO; uniform float showAO, vignette, grain, contrast, saturation, seed, aspect; varying vec2 vUv;
	void main() {
		vec4 c = texture2D( tDiffuse, vUv );
		if ( showAO > 0.5 ) { gl_FragColor = vec4( texture2D( tAO, vUv ).rrr, 1.0 ); return; } // debug: the occlusion
		float l = dot( c.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
		c.rgb = clamp( mix( vec3( l ), c.rgb, saturation ), 0.0, 1.0 );
		c.rgb = clamp( ( c.rgb - 0.5 ) * contrast + 0.5, 0.0, 1.0 ); // display-space contrast around mid grey
		vec2 d = ( vUv - 0.5 ) * vec2( aspect, 1.0 );
		c.rgb *= 1.0 - vignette * smoothstep( 0.45, 1.25, length( d ) );
		float n = fract( sin( dot( floor( gl_FragCoord.xy ) + seed, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ) - 0.5;
		c.rgb += n * grain * ( 1.0 - c.rgb ) * 1.5; // grain mostly in the darks, as film does
		gl_FragColor = c;
	}`},zt={agx:je,neutral:Je,aces:He};function oi(l){let{renderer:e,scene:t,camera:a,sun:i,hemi:s}=l;Ut(),j.ssaoInv.value=new H(1,1);let c=new Y(new Uint8Array([255,255,255,255]),1,1);c.needsUpdate=!0,j.tSSAO.value=c;let d=new G(2,2,{type:B,samples:4}),v=new pt(e,d);v.addPass(new mt(t,a));let f=new vt(new H(256,256),.55,.45,1);v.addPass(f),v.addPass(new gt);let T=new ft(It);v.addPass(T);let P=new X(t,a,2,2);P.output=X.OUTPUT.Off,P.updateGtaoMaterial({radius:2,distanceExponent:1.5,thickness:3,scale:1.5,samples:16,distanceFallOff:1}),P.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,radiusExponent:1.5,rings:2,samples:16}),P.overrideVisibility=function(){let o=this._visibilityCache;this.scene.traverse(r=>{o.set(r,r.visible);let u=r.material;(r.isPoints||r.isLine||r.isSprite||u&&!Array.isArray(u)&&(u.transparent||u.isShaderMaterial||u.depthWrite===!1))&&(r.visible=!1)})};let n={on:!1,ao:!0,aoScale:.5,pcss:!0,grade:!0,mirror:!0,tone:null,showAO:!1,shadowSize:4096,look:St,worldId:null,base:null,frames:0,size:[2,2,1]},x=new G(2,2,{type:B,generateMipmaps:!0,minFilter:et});K.tPlanar.value=x.texture,K.planarMatrix.value=new z;let p=new st,h={fwd:new U,up:new U,target:new U,plane:new rt,clip:new Be,q:new Be},E=new Set,b=o=>{let r=typeof window<"u"&&window.EW&&window.EW.assets,u=r&&r.texture?r.texture(o):null;return u&&u.map};function w(o,r){let u=n.mirror&&n.look.mirror,m=!!(u&&o.map&&u.tex.some(g=>b(g)===o.map));return m&&r&&E.add(r),{ssao:n.ao,mirror:m?u:null}}let S=()=>t.traverse(o=>{o.isMesh&&o.material&&!Array.isArray(o.material)&&Lt(o.material,w(o.material,o))});function M(){let o=n.look.mirror,r=o.y||0;a.updateMatrixWorld(),p.position.copy(a.position),p.position.y=2*r-a.position.y,a.getWorldDirection(h.fwd),h.fwd.y=-h.fwd.y,h.up.set(0,1,0).applyQuaternion(a.quaternion),h.up.y=-h.up.y,p.up.copy(h.up),p.lookAt(h.target.copy(p.position).add(h.fwd)),p.near=a.near,p.far=a.far,p.projectionMatrix.copy(a.projectionMatrix),p.updateMatrixWorld(),p.matrixWorldInverse.copy(p.matrixWorld).invert(),K.planarMatrix.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(p.projectionMatrix).multiply(p.matrixWorldInverse),K.planarY.value=r,h.plane.set(new U(0,1,0),-r).applyMatrix4(p.matrixWorldInverse),h.clip.set(h.plane.normal.x,h.plane.normal.y,h.plane.normal.z,h.plane.constant);let u=p.projectionMatrix.elements;h.q.set((Math.sign(h.clip.x)+u[8])/u[0],(Math.sign(h.clip.y)+u[9])/u[5],-1,(1+u[10])/u[14]),h.clip.multiplyScalar(2/h.clip.dot(h.q)),u[2]=h.clip.x,u[6]=h.clip.y,u[10]=h.clip.z+1-.003,u[14]=h.clip.w,p.projectionMatrixInverse.copy(p.projectionMatrix).invert();for(let g of E)g.visible=!1;let m=e.getRenderTarget();e.setRenderTarget(x),e.clear(),e.render(t,p),e.setRenderTarget(m);for(let g of E)g.visible=!0}let y=o=>Object.assign({},St,Mt[o]||{});function R(){let o=i.shadow.camera,r=i.shadow.mapSize.x,u=.0093*(n.look.sun||1);i.shadow.radius=(o.far-o.near)*u/(o.right-o.left)*r}function D(){for(let o of Ge())o.needsUpdate=!0;wt(t,o=>o.needsUpdate=!0)}function A(){let[o,r,u]=n.size,m=Math.max(1,Math.round(o*u)),g=Math.max(1,Math.round(r*u));P.setSize(Math.max(1,Math.round(m*n.aoScale)),Math.max(1,Math.round(g*n.aoScale))),j.ssaoInv.value.set(1/m,1/g),x.setSize(Math.max(1,m>>1),Math.max(1,g>>1)),K.planarMaxLod.value=Math.max(1,Math.floor(Math.log2(Math.max(m,g)/2))-2)}return{U:n,composer:v,bloom:f,gtao:P,grade:T,planarRT:x,LOOKS:Mt,enable(){n.on||(n.on=!0,this.applyLook(),n.pcss&&(e.shadowMap.type=Ke),i.shadow.bias=-2e-4,i.shadow.normalBias=.02,D(),E.clear(),S())},disable(){if(n.on){n.on=!1,e.toneMapping=He,e.shadowMap.type=Qe,i.shadow.bias=-4e-4,i.shadow.normalBias=.03,i.shadow.radius=1,wt(t,Ye);for(let o of Ge())Ye(o);D(),j.tSSAO.value=c,this.restoreLook()}},set(o={}){let r=n.on;return r&&this.disable(),Object.assign(n,o),o.look&&(n.lookOverride=Object.assign({},o.look)),r&&(this.enable(),A()),Object.assign({},n,{base:void 0})},resize(o,r,u){n.size=[o,r,u],v.setPixelRatio(u),v.setSize(o,r),T.uniforms.aspect.value=o/r,A()},themeChanged(){n.base={hemi:s.intensity,sun:i.intensity,exposure:e.toneMappingExposure,bloom:f.strength},n.worldId=typeof window<"u"&&window.EW&&window.EW.world&&window.EW.world.id||null,E.clear(),n.on&&(this.applyLook(),S())},applyLook(){n.look=Object.assign(y(n.worldId),n.lookOverride||{}),e.toneMapping=zt[n.tone||n.look.tone]||je,n.base||(n.base={hemi:s.intensity,sun:i.intensity,exposure:e.toneMappingExposure,bloom:f.strength}),s.intensity=n.base.hemi*n.look.hemi,i.intensity=n.base.sun*n.look.sunLight,e.toneMappingExposure=n.base.exposure*n.look.exposure,P.updateGtaoMaterial({radius:n.look.aoRadius,scale:n.look.ao}),R()},restoreLook(){t.userData.envBase!=null&&(t.environmentIntensity===t.userData.envSet&&(t.environmentIntensity=t.userData.envBase),delete t.userData.envBase,delete t.userData.envSet),n.base&&(s.intensity=n.base.hemi,i.intensity=n.base.sun,e.toneMappingExposure=n.base.exposure)},render(){t.environment&&((t.userData.envBase==null||t.userData.envSet!==t.environmentIntensity)&&(t.userData.envBase=t.environmentIntensity),t.environmentIntensity=t.userData.envBase*n.look.env,t.userData.envSet=t.environmentIntensity),n.frames++%30===0&&S();let o=e.shadowMap;if(o.autoUpdate=!1,o.needsUpdate=!0,n.ao){let u=t.background;t.background=null,P.render(e,null,null),t.background=u,j.tSSAO.value=P.gtaoMap}n.mirror&&n.look.mirror&&E.size&&M();let r=T.uniforms;r.tAO.value=j.tSSAO.value,r.showAO.value=n.showAO?1:0,r.contrast.value=n.look.contrast==null?1:n.look.contrast,r.saturation.value=n.look.saturation==null?1:n.look.saturation,r.vignette.value=n.grade?.22:0,r.grain.value=n.grade?.018:0,r.seed.value=(r.seed.value+17.31)%1e3,v.render(),o.autoUpdate=!0}}}export{oi as createUltra};
