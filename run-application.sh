echo "Starting up application. Please wait..."
docker build -t medrec-server server/
docker build -t medrec-vue .
docker run -d --restart always --name medrec-server -p 8081:8081 medrec-server
docker run -d --restart always --name medrec-vue -p 8080:8080 medrec-vue
echo "Application running..."
