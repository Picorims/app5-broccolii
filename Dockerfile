# Frontend
FROM node:22 AS frontend
WORKDIR /src-front
COPY src-front/ .
RUN npm install
RUN npm run build

# Backend
FROM python:3.11 AS backend
WORKDIR /src-back
COPY src-back/ .
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY --from=frontend /src-front/dist dist
CMD ["fastapi", "run", "./app/main.py"]