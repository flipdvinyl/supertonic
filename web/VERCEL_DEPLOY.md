# Vercel 배포 가이드

Supertonic 웹 애플리케이션을 Vercel에 배포하는 방법입니다.

## 사전 준비

### 1. Assets 디렉토리 다운로드

먼저 ONNX 모델과 음성 스타일 파일이 필요합니다. **프로젝트 루트**(supertonic/)에서 다음 명령어를 실행하세요:

```bash
# Git LFS 설치가 필요합니다
# macOS: brew install git-lfs && git lfs install
# Linux: sudo apt-get install git-lfs && git lfs install

# Hugging Face에서 모델 다운로드
git clone https://huggingface.co/Supertone/supertonic assets
```

**중요**: `assets` 디렉토리는 `supertonic/` 루트에 있어야 합니다 (`web/` 디렉토리와 같은 레벨).

### 2. 디렉토리 구조 확인

프로젝트 구조는 다음과 같아야 합니다:

```
supertonic/
├── assets/           # Hugging Face에서 다운로드한 모델
│   ├── onnx/
│   └── voice_styles/
└── web/
    ├── vercel.json
    ├── package.json
    ├── prepare-assets.js
    └── ...
```

### 3. 빌드 스크립트 자동화

`prepare-assets.js` 스크립트가 빌드 시 자동으로 `assets`를 `public/assets`로 복사/링크합니다. 
`npm run build` 실행 시 자동으로 처리됩니다.

## Vercel 배포 방법

### 방법 1: Vercel CLI 사용 (권장)

1. **Vercel CLI 설치**
```bash
npm i -g vercel
```

2. **Vercel 로그인**
```bash
vercel login
```

3. **web 디렉토리로 이동 후 배포**
```bash
cd web
vercel
```

4. **프로덕션 배포**
```bash
vercel --prod
```

### 방법 2: Vercel 웹 인터페이스 사용

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. **Root Directory** 설정: `web`으로 설정
5. **Framework Preset**: Vite로 설정
6. **Build Command**: `npm run build` (자동 설정됨)
7. **Output Directory**: `dist` (자동 설정됨)
8. "Deploy" 클릭

### 방법 3: GitHub 연동

1. GitHub 저장소를 Vercel에 연결
2. 프로젝트 설정에서:
   - **Root Directory**: `web`
   - **Framework**: Vite
3. 저장 후 자동 배포됩니다

## 중요 사항

### Assets 파일 크기 제한

Vercel의 무료 플랜은 파일 크기 제한이 있습니다 (100MB per file, 1GB total). 큰 모델 파일의 경우:

**권장 방법:**

1. **Git LFS 사용**: 
   - 대용량 파일은 Git LFS로 관리
   - Vercel은 Git LFS를 자동으로 지원합니다
   - `.gitattributes` 파일에 이미 설정되어 있을 수 있습니다

2. **Vercel Blob Storage 사용** (유료):
   - 모델 파일을 Vercel Blob Storage에 업로드
   - 런타임에 다운로드하여 사용

3. **CDN 사용**:
   - 모델 파일을 별도 CDN(예: Cloudflare R2, AWS S3)에 호스팅
   - 코드에서 CDN URL을 참조하도록 수정

**현재 설정:**
- `prepare-assets.js`가 빌드 시 assets를 public으로 복사합니다
- 빌드된 파일이 Vercel의 배포 제한을 초과하지 않는지 확인하세요

### 환경 변수

현재는 필요한 환경 변수가 없지만, 나중에 API 키 등을 추가할 수 있습니다.

### Build 최적화

- `vercel.json`에 이미 최적화 설정이 포함되어 있습니다
- Assets 파일은 캐싱 헤더가 설정되어 있습니다

## 배포 후 확인

배포가 완료되면:

1. 제공된 URL에서 애플리케이션 접속
2. 모델 로딩 상태 확인
3. 음성 생성 테스트

## 문제 해결

### 모델 로딩 실패

- `assets/onnx/` 경로가 올바른지 확인
- 브라우저 콘솔에서 CORS 오류 확인
- 파일 크기 제한 확인

### 빌드 실패

- Node.js 버전 확인 (18 이상 권장)
- 의존성 설치 오류 확인
- `npm install` 실행 후 재배포

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [Supertonic Hugging Face](https://huggingface.co/Supertone/supertonic)

