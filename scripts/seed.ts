
import { pool, db } from "../server/db.js";
import * as schema from "../shared/schema.js";
import { users, clients, services, profiles } from "../shared/schema.js";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("🗑️ Clearing existing data...");
    await db.delete(users);
    await db.delete(clients);
    await db.delete(services);
    await db.delete(profiles);

    // Insert business profile
    console.log("👤 Inserting business profile...");
    await db.insert(profiles).values({
      name: "Christian Falonzo Photography",
      title: "Hawaii FAA-Certified Drone Photography",
      bio: "Professional aerial and ground photography in Hawaii. FAA-certified drone pilot specializing in weddings, real estate, and stunning Hawaiian landscapes.",
      phone: "808-555-0123",
      email: "info@christianfalonzo.com",
      address: "Honolulu, HI",
      socialMedia: {
        instagram: "@christianfalonzo",
        facebook: "ChristianFalonzoPhotography",
        youtube: "ChristianFalonzoPhoto"
      },
      isActive: true
    });

    // Insert admin user
    console.log("👨‍💼 Inserting admin user...");
    await db.insert(users).values({
      username: "admin",
      email: "admin@christianfalonzo.com",
      password: "$2b$10$example_hash_here", // This should be properly hashed
      role: "admin"
    });

    // Insert sample services
    console.log("📋 Inserting services...");
    await db.insert(services).values([
      {
        name: "Wedding Photography",
        description: "Complete wedding photography coverage with edited gallery and drone shots",
        price: "2500.00",
        duration: 480, // 8 hours
        category: "wedding",
        active: true,
        addOns: [
          { id: "1", name: "Engagement Session", price: 300 },
          { id: "2", name: "Same Day Highlight Reel", price: 500 }
        ]
      },
      {
        name: "Real Estate Photography",
        description: "Professional real estate photography including aerial drone shots",
        price: "450.00",
        duration: 180, // 3 hours
        category: "real_estate",
        active: true,
        addOns: [
          { id: "1", name: "Virtual Tour", price: 200 },
          { id: "2", name: "Twilight Photos", price: 150 }
        ]
      },
      {
        name: "Portrait Session",
        description: "Professional portrait photography session",
        price: "350.00",
        duration: 120, // 2 hours
        category: "portrait",
        active: true,
        addOns: [
          { id: "1", name: "Additional Outfit", price: 50 },
          { id: "2", name: "Location Change", price: 100 }
        ]
      },
      {
        name: "Event Photography",
        description: "Corporate and private event photography with drone coverage",
        price: "800.00",
        duration: 240, // 4 hours
        category: "event",
        active: true,
        addOns: [
          { id: "1", name: "Live Photo Sharing", price: 200 },
          { id: "2", name: "Professional Editing", price: 300 }
        ]
      }
    ]);

    // Insert sample clients
    console.log("👥 Inserting sample clients...");
    await db.insert(clients).values([
      {
        name: "John & Sarah Smith",
        email: "john.sarah@example.com",
        phone: "808-555-0123",
        status: "booked",
        leadSource: "instagram",
        leadScore: 85,
        instagramHandle: "@johnandsmith",
        preferredCommunication: "email",
        timezone: "Pacific/Honolulu",
        lifetimeValue: "2500.00",
        tags: ["wedding", "2025", "oahu"]
      },
      {
        name: "Michael Chen",
        email: "michael@example.com",
        phone: "808-555-0456",
        status: "lead",
        leadSource: "website",
        leadScore: 60,
        preferredCommunication: "phone",
        timezone: "Pacific/Honolulu",
        lifetimeValue: "0.00",
        tags: ["real_estate", "investor"]
      },
      {
        name: "Hawaii Realty Group",
        email: "contact@hawaiirealty.com",
        phone: "808-555-0789",
        status: "repeat",
        leadSource: "referral",
        leadScore: 95,
        preferredCommunication: "email",
        timezone: "Pacific/Honolulu",
        lifetimeValue: "5400.00",
        tags: ["real_estate", "commercial", "recurring"]
      }
    ]);

    console.log("✅ Database seeding completed successfully!");

    // Show summary
    const userCount = await db.select().from(users);
    const clientCount = await db.select().from(clients);
    const serviceCount = await db.select().from(services);
    const profileCount = await db.select().from(profiles);

    console.log("\n📊 Seeding Summary:");
    console.log(`👤 Profiles: ${profileCount.length}`);
    console.log(`👨‍💼 Users: ${userCount.length}`);
    console.log(`👥 Clients: ${clientCount.length}`);
    console.log(`📋 Services: ${serviceCount.length}`);

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
