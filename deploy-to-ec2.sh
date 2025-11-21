#!/bin/bash
# EC2 배포 스크립트

set -e

echo "Frontend EC2 배포 시작..."

# EC2 퍼블릭 IP 설정 (실제 서버 IP로 변경하세요)
EC2_IP=3.34.216.85
# 백엔드 API 포트 (별도 컨테이너로 실행 중)
BACKEND_PORT=8080

echo "EC2 IP: ${EC2_IP}"

echo "파일 압축 중..."

# 프로젝트 압축 (불필요한 파일 제외)
tar -czf frontend-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.svelte-kit' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.deploy.env' \
    --exclude='deploy-to-ec2.sh' \
    --exclude='deploy.sh' \
    --exclude='frontend-deploy.tar.gz' \
    --exclude='rcsv2-deploy.tar.gz' \
    .

echo "압축 완료: frontend-deploy.tar.gz"
echo ""
echo "다음 명령어로 EC2에 업로드하세요:"
echo ""
echo "  # Amazon Linux인 경우 (ec2-user):"
echo "  scp -i ~/Downloads/keypair-panda.pem frontend-deploy.tar.gz ec2-user@${EC2_IP}:~/"
echo ""
echo "  # Ubuntu인 경우 (ubuntu):"
echo "  scp -i ~/Downloads/keypair-panda.pem frontend-deploy.tar.gz ubuntu@${EC2_IP}:~/"
echo ""
echo "  # 연결 테스트 (verbose 모드로 사용자 이름 확인):"
echo "  ssh -v -i ~/Downloads/keypair-panda.pem ec2-user@${EC2_IP}"
echo "  ssh -v -i ~/Downloads/keypair-panda.pem ubuntu@${EC2_IP}"
echo ""
echo "EC2에서 실행할 명령어:"
echo ""
cat <<EOF
  mkdir -p ~/frontend
  cd ~/frontend
  tar -xzf ~/frontend-deploy.tar.gz

  # .env 파일이 없으면 생성
  if [ ! -f .env ]; then
    echo "PUBLIC_API_BASE_URL=https://3.34.216.85/api/v1" > .env
  fi

  # 기존 컨테이너 중지 및 제거
  docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

  # .env 파일을 읽어서 환경 변수로 export 후 빌드
  # docker-compose는 자동으로 .env를 읽지만, build.args에 명시적으로 전달하기 위해 export
  set -a
  source .env
  set +a

  # Docker Compose로 빌드 및 실행
  docker compose up -d --build 2>/dev/null || docker-compose up -d --build
EOF
echo ""
echo "배포 후 접속 URL:"
echo ""
echo "  Frontend: http://${EC2_IP}:3000"
echo ""

