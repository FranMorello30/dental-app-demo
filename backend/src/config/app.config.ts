export const EnvConfiguration = () => ({
  port: process.env.PORT || 3002,
  database: process.env.DB_NAME,
  user: process.env.BD_USERNAME,
  pass: String(process.env.DB_PASSWORD),
  host: process.env.BD_HOST,
  jwt: process.env.JWT_SECRET,
});
