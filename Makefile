SHELL := /bin/sh

IMAGE_NAME ?= taximap-front
CONTAINER_NAME ?= taximap-front
PROJECT_DIR := $(CURDIR)
COMPOSE ?= docker compose

.PHONY: help build run stop restart logs shell clean

help:
	@echo "Targets disponiveis:"
	@echo "  make build       - constroi a imagem docker"
	@echo "  make run         - inicia o container"
	@echo "  make stop        - para o container"
	@echo "  make restart     - reinicia o container"
	@echo "  make logs        - logs do container"
	@echo "  make shell       - shell interactivo no container"
	@echo "  make clean       - remove a imagem e container"

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		--network taximap \
		--restart unless-stopped \
		$(IMAGE_NAME)

stop:
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true

restart: stop run

logs:
	@docker logs -f $(CONTAINER_NAME)

shell:
	@docker exec -it $(CONTAINER_NAME) sh

clean: stop
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true
