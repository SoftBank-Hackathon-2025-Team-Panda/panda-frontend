#!/bin/bash
# EC2 배포 스크립트

set -e

echo "Frontend EC2 배포 시작..."

# EC2 퍼블릭 IP 설정 (고정값)
EC2_IP=3.34.216.85

echo "EC2 IP: ${EC2_IP}"

echo "파일 압축 중..."

# 프로젝트 압축 (불필요한 파일 제외)
tar -czf frontend-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.svelte-kit' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env' \
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
echo "  scp -i ~/Downloads/keypair-panda.pem frontend-deploy.tar.gz ec2-user@${EC2_IP}:~/"
echo ""
echo "EC2에서 실행할 명령어:"
echo ""
cat <<EOF
  ssh -i ~/Downloads/keypair-panda.pem ec2-user@${EC2_IP}
  mkdir -p ~/frontend
  cd ~/frontend
  tar -xzf ~/frontend-deploy.tar.gz

  # .env 파일이 없으면 생성
  if [ ! -f .env ]; then
    echo "PUBLIC_API_BASE_URL=https://3.34.216.85/api/v1" > .env
  fi

  # 기존 컨테이너 중지 및 제거
  docker-compose down 2>/dev/null || true

  # Docker Compose로 빌드 및 실행
  docker-compose up -d --build
EOF
echo ""
echo "배포 후 접속 URL:"
echo ""
echo "  Frontend: http://${EC2_IP}:3000"
echo ""

