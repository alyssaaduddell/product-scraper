FROM mcr.microsoft.com/playwright:v1.43.1-jammy

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npx", "vercel", "dev", "--listen", "0.0.0.0:3000"]
