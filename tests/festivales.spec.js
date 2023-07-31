const request = require("supertest");
const server = require("../src/index");
const jwt = require("jsonwebtoken");
const generateRandomString = require("../src/helpers/utils");

describe("Operaciones CRUD", () => {
  it("Obteniendo un 200", async () => {
    const response = await request(server).get("/festivals").send();
    const status = response.statusCode;
    expect(status).toBe(200);
  });
  it("Obteniendo un 404", async () => {
    const response = await request(server).get("/instrumentos").send();
    const status = response.statusCode;
    expect(status).toBe(404);
  });
  it("Obteniendo un Festival", async () => {
    const { body } = await request(server).get("/festivals/1").send();
    const festival = body;
    expect(festival).toBeInstanceOf(Object);
  });
  it("Obteniendo festivales", async () => {
    const { body } = await request(server).get("/festivals").send();
    const festivals = body;
    expect(festivals).toBeInstanceOf(Array);
  });
  it("Añadiendo un nuevo festival", async () => {
    // const id = Math.floor(Math.random() * 999);
    const festival = {
      name: generateRandomString(),
      location: "localidad incognita",
      description: "tremendo festivalaco hermano",
    };
    const token = jwt.sign(festival, process.env.JWT_SECRET);
    const { body: festivals } = await request(server)
      .post("/festivals")
      .set("Authorization", `Bearer ${token}`)
      .send(festival);

    expect(festivals.name).toEqual(festival.name);
    expect(festivals.location).toEqual(festival.location);
    expect(festivals.description).toEqual(festival.description);
  });
  it("Probando eliminar festival sin token de autorización", async () => {
    const response = await request(server).delete("/festivals/:id").send();
    const status = response.statusCode;
    expect(status).toBe(401);
  });
});
