FROM node:18

WORKDIR /app

# Copy file yarn.lock và package.json
COPY package.json yarn.lock ./

# Cài đặt dependencies bằng yarn
RUN yarn install

# Copy toàn bộ mã nguồn
COPY . .

# Build project NestJS
RUN yarn build

# Mở cổng 5000
EXPOSE 5000

# Chạy ứng dụng ở chế độ production
CMD ["yarn", "start:prod"]
