full_image_name=cr.yandex.ru/${CR_REGISTRY}/${CR_REPOSITORY}-${SERVICE_NAME}-service:${IMAGE_TAG}

docker build -t ${full_image_name} -f ./Dockerfile ./${SERVICE_NAME}
docker push ${full_image_name}
