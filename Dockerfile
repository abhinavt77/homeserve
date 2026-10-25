# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Spring Boot Backend
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Embed frontend build into Spring Boot static resources
COPY --from=frontend-builder /frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# ==========================================
# Stage 3: Minimal Production JRE Image
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN useradd -m -u 1001 appuser && mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
COPY --from=backend-builder /backend/target/*.jar app.jar
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=local
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
