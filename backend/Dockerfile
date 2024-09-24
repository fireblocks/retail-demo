FROM node:20

WORKDIR /usr/src/app

# Set npm registry explicitly
RUN npm config set registry https://registry.npmjs.org/

# Copy only package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

EXPOSE 3000

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/app.ts"]