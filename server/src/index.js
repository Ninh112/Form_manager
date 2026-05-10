require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = Number(process.env.PORT || 4000);

async function bootstrap() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Cannot start server:", error.message);
  process.exit(1);
});
