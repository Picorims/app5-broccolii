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
# Generate new JWT_SECRET
RUN rm -f JWT_SECRET
RUN openssl rand -base64 32 > JWT_SECRET
RUN python ./app/sql_script.py
EXPOSE 8000
# CMD ["fastapi", "run", "./app/main.py"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]