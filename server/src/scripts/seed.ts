import "dotenv/config";
import { initDatabases } from "../db";
import {
  roles,
  employeeRoles,
  employees,
  entities,
  entitiesGr,
  regions,
  businessTypes,
  customers,
  verticals,
  horizontals,
  dealTypes,
} from "../schema";
import { hashPassword } from "../utils/password";
import { and, eq } from "drizzle-orm";

// GEO_HEADs
  const geoHeads = [
    { name: "Chang", email: "chang@example.com" },
    { name: "Sonu", email: "sonu@example.com" },
    { name: "Muhusin", email: "muhusin@example.com" },
    { name: "Ali", email: "ali@example.com" },
    { name: "Meenaz", email: "meenaz@example.com" },
  ];

   // Practice Heads
  const practiceHeads = [
    { name: "Manju", email: "manju@example.com" },
    { name: "Satish", email: "satish@example.com" },
    { name: "Karnendu", email: "karnendu@example.com" },
    { name: "Saibal", email: "saibal@example.com" },
    { name: "Muhusin", email: "muhusin@example.com" },
    { name: "Meenaz", email: "meenaz@example.com" },
  ];

  // BDMs
  const bdms = [
    { name: "Sayoni", email: "sayoni@example.com" },
    { name: "Sanjay", email: "sanjay@example.com" },
    { name: "Sonu", email: "sonu@example.com" },
    { name: "Apurva", email: "apurva@example.com" },
    { name: "Sneha", email: "sneha@example.com" },
    { name: "Chang", email: "chang@example.com" },
    { name: "Annie", email: "annie@example.com" },
    { name: "Pragathi", email: "pragathi@example.com" },
    { name: "Santosh", email: "santosh@example.com" },
    { name: "Manjeet", email: "manjeet@example.com" },
    { name: "Seetha", email: "seetha@example.com" },
    { name: "Vivek", email: "vivek@example.com" },
    { name: "Ali", email: "ali@example.com" },
    { name: "Pooja V", email: "pooja.v@example.com" },
    { name: "Desmond", email: "desmond@example.com" },
    { name: "Roshan", email: "roshan@example.com" },
  ];

  const customersList =[
    { name: "ABB" },
    { name: "Avantel Limited" },
    { name: "Awak Technologies India Private Limited" },
    { name: "Bharat Electronics Limited" },
    { name: "ERLPhase Power Technologies Ltd" },
    { name: "Flexicare (Group) Limited" },
    { name: "Johnson Controls India Pvt Ltd" },
    { name: "Micromass UK Limited" },
    { name: "New Customer" },
    { name: "PHILIPS GLOBAL BUSINESS SERVICES LLP" },
    { name: "Philips India Limited" },
    { name: "Pure Storage India Private Limited" },
    { name: "Symbol Technologies India Private Limited" },
    { name: "Vocera Communication India Private Limited" },
    { name: "Waters" },
    { name: "Waters India Private Limited" },
    { name: "Keysight Technologies Malaysia Sdn Bhd" },
    { name: "Nexperia" },
    { name: "Nexperia Germany GMBH" },
    { name: "Nexperia GMBH" },
    { name: "OSRAM Opto Semiconductors (Malaysia) Sdn. Bhd." },
    { name: "Education & Training Quality Authority" },
    { name: "HORIBA Instruments (Singapore) Pte Ltd" },
    { name: "Shimadzu Asia Pacific Pte Ltd" },
    { name: "Elekta Limited" },
    { name: "Mesh-Net Ltd" },
    { name: "OLYMPUS SURGICAL TECHNOLOGIES EUROPE" },
    { name: "PORTICOS, INC." },
    { name: "Analog Devices Inc" },
    { name: "Axcelis Technologies Inc." },
    { name: "DMF Lighting" },
    { name: "Hewlett Packard Enterprise Company" },
    { name: "Veeco Process Equipment Inc." },
    { name: "Marsh and McLennan Companies Inc" },
    { name: "VICTOR O.SCHINNERER & COMPANY, INC" },
    { name: "NETAPP INC" },
    { name: "NetApp India Private Limited" },
    { name: "CloudAlly Ltd" },
    { name: "HCL Technologies Germany GmbH(A128)" },
    { name: "HCL Technologies Romania s.r.l(A517)" },
    { name: "HCL TECHNOLOGIES UK LIMITED(A214)" },
    { name: "Hewlett Packard Enterprise Romania SRL" },
    { name: "Hewlett Packard Enterprise Romania SRL" },
    { name: "Hewlett Packard International TradeB.V." },
    { name: "Hewlett-Packard GmbH" },
    { name: "InBev Belgium BV" },
    { name: "Micro Focus Deutschland GmbH" },
    { name: "Micro Focus Pty Limited" },
    { name: "Micro Focus Software HK Ltd" },
    { name: "Micro Focus Software Romania SRL" },
    { name: "Micro Focus Srl" },
    { name: "Seagate Technology (Netherlands) B.V." },
    { name: "Ametek Instruments India Pvt. Ltd." },
    { name: "Carl Zeiss India (Bangalore) Pvt. Ltd." },
    { name: "Hewlett Packard Enterprise India Private Limited" },
    { name: "Micro Focus Software India Private Limited" },
    { name: "Nutanix Technologies India Private Limited" },
    { name: "Rockwell Automation India Pvt Ltd" },
    { name: "Y3 Technologies" },
    { name: "Cummins Sales and Service Sdn. Bhd." },
    { name: "EntServ Malaysia Sdn. Bhd." },
    { name: "Innomotics Sdn. Bhd." },
    { name: "Jabil Circuit Sdn Bhd" },
    { name: "KellyOCG Malaysia Sdn Bhd" },
    { name: "Lumileds Malaysia Sdn Bhd" },
    { name: "MOTOROLA SOLUTIONS MALAYSIA SDN BHD" },
    { name: "Motorola Solutions Malaysia Sdn. Bhd." },
    { name: "Nexperia B.V." },
    { name: "Nexperia Malaysia Sdn. Bhd." },
    { name: "Open Text Malaysia SDN BHD" },
    { name: "OSRAM GmbH" },
    { name: "Perpetuuiti Technosoft Services DMCC" },
    { name: "Renesas Semiconductor Design (Malaysia) Sdn. Bhd." },
    { name: "Seagate Global Business Services (Malaysia) Sdn Bhd" },
    { name: "Siemens Energy Sdn Bhd" },
    { name: "Siemens Industry Software Sdn. Bhd." },
    { name: "Siemens Malaysia Sdn. Bhd." },
    { name: "Syarikat Takaful Malaysia Keluarga Berhad" },
    { name: "TBI" },
    { name: "YTL PowerSeraya Pte. Limited" },
    { name: "ALUMINIUM BAHRAIN B.S.C" },
    { name: "Arab Banking Corporation (B.S.C)" },
    { name: "BAHRAIN COMMERCIAL FACILITIES COMPANY B.S.C" },
    { name: "Yokogawa Middle East B.S.C" },
    { name: "Bahrain Institute of Banking and Finance (BIBF)" },
    { name: "Bahrain Islamic Bank" },
    { name: "Batelco, a brand operated under Beyon B.S.C." },
    { name: "CrediMax B.S.C.(c)" },
    { name: "Seera Investment Company B.S.C.(c)" },
    { name: 'stc Bahrain B.S.C.(Closed) ("stc")' },
    { name: "DXC Technology Services Singapore Pte. Ltd" },
    { name: "East West Banking Corporation" },
    { name: "Energy Market Company Pte Ltd" },
    { name: "HP Singapore (Private) Limited" },
    { name: "India International Insurance Pte Ltd" },
    { name: "Keysight Technologies Singapore Pte Ltd" },
    { name: "Maybank Singapore Limited" },
    { name: "Merck Pte Ltd" },
    { name: "Micro Focus Software Pte. Ltd." },
    { name: "SBS Transit Ltd" },
    { name: "ST Engineering Advanced Networks & Sensors Pte. Ltd." },
    { name: "ST Engineering Training & Simulation Systems Pte. Ltd." },
    { name: "ST Engineering Urban Solutions Ltd." },
    { name: "YTL Power Seraya" },
    { name: "Eateam Solutions Ltd" },
    { name: "Open Text UK Limited" },
    { name: "Rocket Software(Micro Focus Limited)" },
    { name: "WATERS TECHNOLOGIES CORPORATION" },
    { name: "COMPUTER AID, INC." },
    { name: "DELOITTE CONSULTING" },
    { name: "Fidelity TalentSource LLC" },
    { name: "MANAGEMENT DECISION, INC." },
    { name: "MCINNIS CONSULTING SERVICES, INC." },
    { name: "PHEAA" },
    { name: "SYSTEM ONE HOLDINGS, LLC." },
    { name: "Crestron Electronics, Inc." },
    { name: "ELEKTA INC USA" },
    { name: "MPHASIS CORPORATION USA" },
    { name: "SAMSUNG SEMICONDUCTOR, INC." },
    { name: "Cohesity INC" },
    { name: "Pure Storage Inc" },
    { name: "Yokogawa Corporation of America" },
  ];

async function run() {
  const dbs = await initDatabases();
  const db = dbs.pg;

  // 1. Add Entities
  await db
    .insert(entities)
    .values([{ name: "GER" }, { name: "IND" }, { name: "MAL" }, { name: "MME" }, { name: "SIN" }, { name: "UKG" }, { name: "US" }]);
  console.log("Inserted entities");

  //2. Entity GR
  await db
    .insert(entitiesGr)
    .values([
      { name: "GER" },
      { name: "IND" },
      { name: "MAL" },
      { name: "MME" },
      { name: "SIN" },
      { name: "UKG" },
      { name: "USC" },
      { name: "USE" },
      { name: "USN" },
      { name: "USW" },
      { name: "USS" },
    ]);
  console.log("Inserted entitiesGr");

  // 3. Add Region
  await db.insert(regions).values([{ name: "APAC" }, { name: "EMEA" }, { name: "US" }]);
  console.log("Inserted regions");

  // 4. Add Roles
  await db
    .insert(roles)
    .values([{ name: "CSO" }, { name: "BUH" }, { name: "BDM" }, { name: "GEO_HEAD" }, { name: "PRACTICE_HEAD" }, { name: "ADMIN" }]);
  console.log("Inserted roles");

  // 5. Add Business Types
  await db.insert(businessTypes).values([{ name: "Backlog" }, { name: "New" }]);
  console.log("Inserted businessTypes");

  // 5.1 Add Deal Types
  await db.insert(dealTypes).values([{ name: "Existing" }, { name: "New" }, { name: "Renewal" }]);
  console.log("Inserted dealTypes");

  // 6. Add Customers
  await db.insert(customers).values(customersList);
  console.log("Inserted customers");

  //7.Add Verticals
  await db.insert(verticals).values([{ name: "Hi-Tech" }, { name: "Medical/ Analytical" }, { name: "Storage" }, { name: "Semicon" }]);
  console.log("Inserted verticals");

  //8. Add Horizontals
  await db.insert(horizontals).values([
    { name: "EDS & IOT" },
    { name: "Software Development" },
    { name: "Testing" },
    { name: "AI / ML" },
    { name: "Support" },
  ]);
  console.log("Inserted horizontals");

  //9. Add Employees
  const passwordHash = await hashPassword("Mind@1234");
  const roleMap = await db
    .select()
    .from(roles)
    .then((roles) => {
      const map: Record<string, number> = {};
      roles.forEach((role) => {
        map[role.name] = role.id;
      });
      return map;
    });
  // Helper to upsert employee and assign role
  async function upsertEmployeeWithRole({
    name,
    email,
    password,
    roleName,
  }: {
    name: string;
    email: string;
    password: string;
    roleName: string;
  }) {
    // Try to find existing employee by email
    const existing = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.email, email))
      .then((rows) => rows[0]);
    let employeeId;
    if (existing) {
      employeeId = existing.id;
    } else {
      employeeId = await db
        .insert(employees)
        .values({ name, email, password })
        .returning({ id: employees.id })
        .then((rows) => rows[0].id);
    }
    // Always insert role (if not already assigned)
    const alreadyHasRole = await db
      .select()
      .from(employeeRoles)
      .where(and(eq(employeeRoles.employeeId, employeeId), eq(employeeRoles.roleId, roleMap[roleName])))
      .then((rows) => rows.length > 0);
    if (!alreadyHasRole) {
      await db.insert(employeeRoles).values({ employeeId, roleId: roleMap[roleName] });
    }
    return employeeId;
  }

  // Add Admin
  await upsertEmployeeWithRole({ name: "Admin", email: "admin@examole.com", password: passwordHash, roleName: "ADMIN" });
  // Add CSO
  await upsertEmployeeWithRole({ name: "CSO", email: "cso@example.com", password: passwordHash, roleName: "CSO" });
  // Add BUH
  await upsertEmployeeWithRole({ name: "BUH", email: "buh@example.com", password: passwordHash, roleName: "BUH" });

 
  for (const emp of practiceHeads) {
    await upsertEmployeeWithRole({ ...emp, password: passwordHash, roleName: "PRACTICE_HEAD" });
  }

  
  for (const emp of bdms) {
    await upsertEmployeeWithRole({ ...emp, password: passwordHash, roleName: "BDM" });
  }

  
  for (const emp of geoHeads) {
    await upsertEmployeeWithRole({ ...emp, password: passwordHash, roleName: "GEO_HEAD" });
  }
  console.log("Seeded all employees and roles");
}

run().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
