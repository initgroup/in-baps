# 설치 패키지 보관

`.local/ops/setup.ps1 -PrepareOffline`로 현재 OS와 Python 버전의 설치 패키지를 이 폴더에 보관합니다. `-Offline` 옵션은 이 폴더만 사용하여 설치합니다. 실행 파일·wheel·archive는 Git에서 제외하며 `SHA256SUMS.txt`에 검증 해시를 기록합니다. 소프트웨어 라이선스와 재배포 조건을 준수합니다. Python과 Node 런타임 설치 파일은 공식 배포 사이트에서 해당 OS용으로 준비해야 합니다. 다른 OS나 Python ABI에서는 패키지를 다시 받아야 합니다.
