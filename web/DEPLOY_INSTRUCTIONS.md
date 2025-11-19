# Vercel 배포 가이드 (Fork된 저장소 사용)

이 저장소는 이미 Vercel 배포 설정이 완료되어 있습니다.

## 1단계: 변경사항 푸시

먼저 로컬 변경사항을 GitHub에 푸시합니다:

```bash
cd /Users/d/supertonic
git push origin main
```

만약 브랜치가 diverged 상태라면:

```bash
# 원격 변경사항 확인 후 병합
git pull origin main --rebase
# 또는
git pull origin main
git push origin main
```

## 2단계: Vercel 배포

### 방법 A: Vercel 웹 인터페이스 (권장)

1. [Vercel](https://vercel.com)에 로그인 (GitHub 계정으로 로그인)
2. "Add New Project" 클릭
3. GitHub 저장소 목록에서 `flipdvinyl/supertonic` 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `web` (중요!)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
5. "Deploy" 클릭

### 방법 B: Vercel CLI

```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 로그인
vercel login

# web 디렉토리로 이동 후 배포
cd /Users/d/supertonic/web
vercel

# 프로덕션 배포
vercel --prod
```

## 3단계: Assets 설정

**중요**: Vercel 빌드 시 assets 디렉토리가 필요합니다.

### 옵션 1: Git LFS 사용 (권장)

assets 디렉토리를 Git LFS로 관리하면 Vercel이 자동으로 다운로드합니다:

```bash
cd /Users/d/supertonic

# Git LFS 설치 확인
git lfs install

# Hugging Face에서 모델 다운로드
git clone https://huggingface.co/Supertone/supertonic assets

# assets를 Git LFS로 추가 (선택사항)
cd assets
git lfs track "*.onnx"
git lfs track "*.json"
```

그리고 `.gitattributes`에 LFS 설정이 있는지 확인하세요.

### 옵션 2: 빌드 시 다운로드

Vercel 빌드 시 assets를 자동으로 다운로드하도록 설정:

`web/package.json`에 빌드 스크립트 추가:

```json
{
  "scripts": {
    "prepare": "node prepare-assets.js",
    "prebuild": "bash -c 'if [ ! -d ../assets ]; then git clone https://huggingface.co/Supertone/supertonic ../assets || true; fi'",
    "build": "npm run prepare && vite build"
  }
}
```

### 옵션 3: 환경 변수로 CDN 사용

모델 파일을 별도 CDN에 호스팅하고, 코드에서 CDN URL을 참조하도록 수정

## 4단계: 배포 확인

배포가 완료되면:

1. Vercel 대시보드에서 배포 URL 확인
2. 브라우저에서 접속하여 모델 로딩 확인
3. 음성 생성 테스트

## 문제 해결

### 빌드 실패: assets 디렉토리 없음

- `prepare-assets.js`가 경고만 출력하고 계속 진행합니다
- 실제 모델 파일이 없으면 런타임에 오류가 발생합니다
- 위의 "Assets 설정" 단계를 따라주세요

### 파일 크기 제한

Vercel 무료 플랜 제한:
- 파일당 최대 100MB
- 총 배포 크기 1GB

해결책:
- Git LFS 사용
- 모델 파일을 CDN에 호스팅
- Vercel Pro 플랜 사용

### CORS 오류

모델 파일이 다른 도메인에서 로드되는 경우 CORS 설정이 필요할 수 있습니다.

## 추가 리소스

- 저장소: https://github.com/flipdvinyl/supertonic
- 원본 저장소: https://github.com/supertone-inc/supertonic
- Hugging Face 모델: https://huggingface.co/Supertone/supertonic
- Vercel 문서: https://vercel.com/docs

