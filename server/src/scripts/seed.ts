import "dotenv/config";
import { initDatabases } from "../db";
import { roles, employeeRoles, employees } from "../schema";
import { hashPassword } from "../utils/password";
import { and, eq } from "drizzle-orm";

async function run() {
  const dbs = await initDatabases();
  const db = dbs.pg;

  // ensure default roles (create if missing)
  const roleNames = ["admin", "manager", "employee"];
  const roleIds: Record<string, number> = {};

  for (const name of roleNames) {
    const existing = await db.select().from(roles).where(eq(roles.name, name)).then((rows) => rows[0]);
    if (existing) {
      roleIds[name] = existing.id;
      console.log("Role exists", name);
    } else {
      const inserted = await db.insert(roles).values({ name }).returning();
      const r = inserted[0];
      roleIds[name] = r.id;
      console.log("Inserted role", name);
    }
  }

  // ensure admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const found = await db.select().from(employees).where(eq(employees.email, adminEmail)).then((rows) => rows[0]);
  let adminId: number;
  if (found) {
    adminId = found.id;
    console.log("Admin user already exists:", adminEmail);
  } else {
    const hashed = await hashPassword(adminPass);
    const inserted = await db
      .insert(employees)
      .values({ name: "Admin", email: adminEmail, employeeCode: "ADMIN", password: hashed })
      .returning();
    adminId = inserted[0].id;
    console.log("Created admin user:", adminEmail);
  }

  // ensure mapping in employee_roles
  const mapping = await db
    .select()
    .from(employeeRoles)
    .where(and(eq(employeeRoles.employeeId, adminId), eq(employeeRoles.roleId, roleIds.admin)))
    .then((rows) => rows[0]);

  if (!mapping) {
    await db.insert(employeeRoles).values({ employeeId: adminId, roleId: roleIds.admin });
    console.log("Assigned admin role to user");
  } else {
    console.log("Admin role mapping exists");
  }

  console.log("Seeding complete");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
