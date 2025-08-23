import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseStorage } from "./storage";
import { getDatabaseInitializer } from "./database-init";
import {
  ColumnBaseConfig,
  ColumnDataType,
  NeonAuthToken,
  Query,
  SQL,
} from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import {
  PgUpdateBuilder,
  PgTable,
  TableConfig,
  PgInsertBase,
  PgInsertBuilder,
  PgInsertSelectQueryBuilder,
  QueryBuilder,
  PgColumn,
  PgDeleteBase,
  PgDeleteDynamic,
  PgDeletePrepare,
} from "drizzle-orm/pg-core";
import { QueryResult } from "pg";

// Mock the database initializer
vi.mock("./database-init", () => ({
  getDatabaseInitializer: vi.fn(() => ({
    getInitializationStatus: vi.fn().mockReturnValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
    initialize: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock the database connection with proper chain methods
vi.mock("./db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => Promise.resolve([])),
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
            orderBy: vi.fn(() => ({
              then: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        groupBy: vi.fn(() => ({
          having: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

describe("Database Layer Tests", () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
    vi.clearAllMocks();
  });

  describe("Database Initialization", () => {
    it("should initialize database successfully", async () => {
      const initializer = getDatabaseInitializer();
      const result = await initializer.initialize();
      expect(result).toBe(true);
    });

    it("should test database connection", async () => {
      const initializer = getDatabaseInitializer();
      const result = await initializer.testConnection();
      expect(result).toBe(true);
    });

    it("should return initialization status", () => {
      const initializer = getDatabaseInitializer();
      const status = initializer.getInitializationStatus();
      expect(status).toBe(true);
    });
  });

  describe("Client Operations", () => {
    const mockClient = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      notes: "Test client",
      tags: ["vip"],
      status: "lead",
      createdAt: new Date(),
    };

    it("should create a client", async () => {
      const mockDb = await import("./db");
      const mockInsert = vi.mocked(mockDb.db.insert);
      mockInsert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClient]),
        }),
      } as any);

      const result = await storage.createClient({
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
      });

      expect(mockInsert).toHaveBeenCalled();
      expect(result).toEqual(mockClient);
    });

    it("should get all clients", async () => {
      const mockDb = await import("./db");
      const mockSelect = vi.mocked(mockDb.db.select);
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([mockClient]),
        }),
      } as any);

      const result = await storage.getClients();
      expect(mockSelect).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get client by ID", async () => {
      const mockDb = await import("./db");
      const mockSelect = vi.mocked(mockDb.db.select);
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockClient]),
        }),
      } as any);

      const result = await storage.getClient(1);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockClient);
    });

    it("should get client by email", async () => {
      const mockDb = await import("./db");
      const mockSelect = vi.mocked(mockDb.db.select);
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockClient]),
        }),
      } as any);

      const result = await storage.getClientByEmail("john@example.com");
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockClient);
    });

    it("should update client", async () => {
      const updatedClient = { ...mockClient, name: "John Updated" };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedClient]),
          }),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        _: {
          table: undefined,
        },
        setToken: function (
          token: NeonAuthToken,
        ): PgUpdateBuilder<PgTable<TableConfig>, NodePgQueryResultHKT> {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.updateClient(1, { name: "John Updated" });
      expect(result).toEqual(updatedClient);
    });
  });

  describe("Service Operations", () => {
    const mockService = {
      id: 1,
      name: "Wedding Photography",
      description: "Full wedding coverage",
      price: "2500.00",
      duration: 480,
      category: "wedding",
      active: true,
    };

    it("should create a service", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockService]),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        overridingSystemValue: function (): Omit<
          PgInsertBuilder<PgTable<TableConfig>, NodePgQueryResultHKT, true>,
          "overridingSystemValue"
        > {
          throw new Error("Function not implemented.");
        },
        select: function (
          selectQuery: (
            qb: QueryBuilder,
          ) => PgInsertSelectQueryBuilder<PgTable<TableConfig>>,
        ): PgInsertBase<
          PgTable<TableConfig>,
          NodePgQueryResultHKT,
          undefined,
          undefined,
          false,
          never
        > {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.createService({
        name: "Wedding Photography",
        description: "Full wedding coverage",
        price: "2500.00",
        duration: 480,
        category: "wedding",
      });

      expect(result).toEqual(mockService);
    });

    it("should get active services", async () => {
      const mockDb = await import("./db");
      // @ts-ignore
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockService]),
          }),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getActiveServices();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update service", async () => {
      const updatedService = { ...mockService, price: "3000.00" };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedService]),
          }),
        }),
      });

      const result = await storage.updateService(1, { price: "3000.00" });
      expect(result).toEqual(updatedService);
    });

    it("should delete service", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      await expect(storage.deleteService(1)).resolves.toBeUndefined();
    });
  });

  describe("Booking Operations", () => {
    const mockBooking = {
      id: 1,
      clientId: 1,
      serviceId: 1,
      date: new Date("2024-06-15"),
      duration: 240,
      location: "Honolulu Beach",
      totalPrice: "1500.00",
      status: "pending",
      createdAt: new Date(),
      client: { id: 1, name: "John Doe", email: "john@example.com" },
      service: { id: 1, name: "Portrait Session", price: "1500.00" },
    };

    it("should create a booking", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBooking]),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        overridingSystemValue: function (): Omit<
          PgInsertBuilder<PgTable<TableConfig>, NodePgQueryResultHKT, true>,
          "overridingSystemValue"
        > {
          throw new Error("Function not implemented.");
        },
        select: function (
          selectQuery: (
            qb: QueryBuilder,
          ) => PgInsertSelectQueryBuilder<PgTable<TableConfig>>,
        ): PgInsertBase<
          PgTable<TableConfig>,
          NodePgQueryResultHKT,
          undefined,
          undefined,
          false,
          never
        > {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.createBooking({
        clientId: 1,
        serviceId: 1,
        date: new Date("2024-06-15"),
        duration: 240,
        location: "Honolulu Beach",
        totalPrice: "1500.00",
      });

      expect(result).toEqual(mockBooking);
    });

    it("should get all bookings with relations", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                then: vi.fn().mockResolvedValue([
                  {
                    bookings: mockBooking,
                    clients: mockBooking.client,
                    services: mockBooking.service,
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      const result = await storage.getBookings();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get booking by ID with relations", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  bookings: mockBooking,
                  clients: mockBooking.client,
                  services: mockBooking.service,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await storage.getBooking(1);
      expect(result).toBeDefined();
      expect(result?.client).toBeDefined();
      expect(result?.service).toBeDefined();
    });

    it("should get bookings by date range", async () => {
      const startDate = new Date("2024-06-01");
      const endDate = new Date("2024-06-30");

      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  then: vi.fn().mockResolvedValue([
                    {
                      bookings: mockBooking,
                      clients: mockBooking.client,
                      services: mockBooking.service,
                    },
                  ]),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await storage.getBookingsByDateRange(startDate, endDate);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update booking", async () => {
      const updatedBooking = { ...mockBooking, status: "confirmed" };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedBooking]),
          }),
        }),
      });

      const result = await storage.updateBooking(1, { status: "confirmed" });
      expect(result.status).toBe("confirmed");
    });
  });

  describe("Gallery Operations", () => {
    const mockImage = {
      id: 1,
      bookingId: 1,
      filename: "wedding-photo-1.jpg",
      originalName: "IMG_001.jpg",
      url: "https://example.com/images/wedding-photo-1.jpg",
      thumbnailUrl: "https://example.com/thumbs/wedding-photo-1.jpg",
      category: "wedding",
      tags: ["outdoor", "sunset"],
      featured: false,
      uploadedAt: new Date(),
    };

    it("should create gallery image", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockImage]),
        }),
      });

      const result = await storage.createGalleryImage({
        filename: "wedding-photo-1.jpg",
        originalName: "IMG_001.jpg",
        url: "https://example.com/images/wedding-photo-1.jpg",
        category: "wedding",
      });

      expect(result).toEqual(mockImage);
    });

    it("should get all gallery images", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([mockImage]),
        }),
      });

      const result = await storage.getGalleryImages();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get featured images", async () => {
      const featuredImage = { ...mockImage, featured: true };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([featuredImage]),
          }),
        }),
      });

      const result = await storage.getFeaturedImages();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get images by booking", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockImage]),
          }),
        }),
      });

      const result = await storage.getImagesByBooking(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update gallery image", async () => {
      const updatedImage = { ...mockImage, featured: true };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedImage]),
          }),
        }),
      });

      const result = await storage.updateGalleryImage(1, { featured: true });
      expect(result.featured).toBe(true);
    });

    it("should delete gallery image", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      await expect(storage.deleteGalleryImage(1)).resolves.toBeUndefined();
    });
  });

  describe("Analytics Operations", () => {
    it("should get monthly revenue", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 5000 }]),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getMonthlyRevenue(2024, 6);
      expect(typeof result).toBe("number");
    });

    it("should get booking stats", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 10 }]),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getBookingStats();
      expect(result).toHaveProperty("totalBookings");
      expect(result).toHaveProperty("pendingBookings");
      expect(result).toHaveProperty("confirmedBookings");
      expect(result).toHaveProperty("monthlyRevenue");
    });

    it("should get business KPIs", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 25 }]),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getBusinessKPIs();
      expect(result).toHaveProperty("monthlyRecurringRevenue");
      expect(result).toHaveProperty("totalClients");
      expect(result).toHaveProperty("totalBookings");
      expect(result).toHaveProperty("completionRate");
    });

    it("should get client metrics", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockReturnValue({
            having: vi.fn().mockResolvedValue([{ clientId: 1, count: 3 }]),
          }),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getClientMetrics();
      expect(result).toHaveProperty("totalClients");
      expect(result).toHaveProperty("newThisMonth");
      expect(result).toHaveProperty("repeatClients");
      expect(result).toHaveProperty("avgLifetimeValue");
    });
  });

  describe("Contract Operations", () => {
    const mockContract = {
      id: 1,
      clientId: 1,
      bookingId: 1,
      contractType: "individual",
      serviceType: "wedding",
      status: "draft",
      title: "Wedding Photography Contract",
      templateContent: "Contract template content...",
      totalAmount: "2500.00",
      createdAt: new Date(),
      client: { id: 1, name: "John Doe", email: "john@example.com" },
    };

    it("should create contract", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockContract]),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        overridingSystemValue: function (): Omit<
          PgInsertBuilder<PgTable<TableConfig>, NodePgQueryResultHKT, true>,
          "overridingSystemValue"
        > {
          throw new Error("Function not implemented.");
        },
        select: function (
          selectQuery: (
            qb: QueryBuilder,
          ) => PgInsertSelectQueryBuilder<PgTable<TableConfig>>,
        ): PgInsertBase<
          PgTable<TableConfig>,
          NodePgQueryResultHKT,
          undefined,
          undefined,
          false,
          never
        > {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.createContract({
        clientId: 1,
        contractType: "individual",
        title: "Wedding Photography Contract",
        templateContent: "Contract template content...",
      });

      expect(result).toEqual(mockContract);
    });

    it("should get all contracts with client relations", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                contracts: mockContract,
                clients: mockContract.client,
              },
            ]),
          }),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getContracts();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update contract", async () => {
      const updatedContract = { ...mockContract, status: "sent" };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedContract]),
          }),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        _: {
          table: undefined,
        },
        setToken: function (
          token: NeonAuthToken,
        ): PgUpdateBuilder<PgTable<TableConfig>, NodePgQueryResultHKT> {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.updateContract(1, { status: "sent" });
      expect(result.status).toBe("sent");
    });

    it("should send contract to portal", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        _: {
          table: undefined,
        },
        setToken: function (
          token: NeonAuthToken,
        ): PgUpdateBuilder<PgTable<TableConfig>, NodePgQueryResultHKT> {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.sendContractToPortal(1);
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("portalLink");
    });
  });

  describe("Contact Message Operations", () => {
    const mockMessage = {
      id: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "987-654-3210",
      subject: "Wedding Inquiry",
      message: "I would like to book a wedding photographer...",
      status: "unread",
      priority: "normal",
      source: "website",
      createdAt: new Date(),
    };

    it("should create contact message", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockMessage]),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        overridingSystemValue: function (): Omit<
          PgInsertBuilder<PgTable<TableConfig>, NodePgQueryResultHKT, true>,
          "overridingSystemValue"
        > {
          throw new Error("Function not implemented.");
        },
        select: function (
          selectQuery: (
            qb: QueryBuilder,
          ) => PgInsertSelectQueryBuilder<PgTable<TableConfig>>,
        ): PgInsertBase<
          PgTable<TableConfig>,
          NodePgQueryResultHKT,
          undefined,
          undefined,
          false,
          never
        > {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.createContactMessage({
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Wedding Inquiry",
        message: "I would like to book a wedding photographer...",
      });

      expect(result).toEqual(mockMessage);
    });

    it("should get all contact messages", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([mockMessage]),
        }),
        fields: undefined,
        session: undefined,
        dialect: undefined,
        withList: undefined,
        distinct: undefined,
      });

      const result = await storage.getContactMessages();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update contact message", async () => {
      const updatedMessage = { ...mockMessage, status: "read" };
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedMessage]),
          }),
        }),
        table: undefined,
        session: undefined,
        dialect: undefined,
        _: {
          table: undefined,
        },
        setToken: function (
          token: NeonAuthToken,
        ): PgUpdateBuilder<PgTable<TableConfig>, NodePgQueryResultHKT> {
          throw new Error("Function not implemented.");
        },
      });

      const result = await storage.updateContactMessage(1, { status: "read" });
      expect(result.status).toBe("read");
    });

    it("should delete contact message", async () => {
      const mockDb = await import("./db");
      vi.mocked(mockDb.db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
        _: {
          dialect: "pg",
          table: undefined,
          queryResult: undefined,
          selectedFields: undefined,
          returning: undefined,
          dynamic: false,
          excludedMethods: [],
          result: undefined,
        },
        session: undefined,
        dialect: undefined,
        config: undefined,
        returning: function (): Omit<
          PgDeleteBase<
            PgTable<TableConfig>,
            NodePgQueryResultHKT,
            Record<
              string,
              PgColumn<ColumnBaseConfig<ColumnDataType, string>, {}, {}>
            >,
            {
              [x: string]: unknown;
            },
            false,
            "returning"
          >,
          "returning"
        > {
          throw new Error("Function not implemented.");
        },
        toSQL: function (): Query {
          throw new Error("Function not implemented.");
        },
        prepare: function (
          name: string,
        ): PgDeletePrepare<
          PgDeleteBase<
            PgTable<TableConfig>,
            NodePgQueryResultHKT,
            undefined,
            undefined,
            false,
            never
          >
        > {
          throw new Error("Function not implemented.");
        },
        execute: function (
          placeholderValues?: Record<string, unknown>,
        ): Promise<QueryResult<never>> {
          throw new Error("Function not implemented.");
        },
        $dynamic: function (): PgDeleteDynamic<
          PgDeleteBase<
            PgTable<TableConfig>,
            NodePgQueryResultHKT,
            undefined,
            undefined,
            false,
            never
          >
        > {
          throw new Error("Function not implemented.");
        },
        catch: function <TResult = never>(
          onRejected?:
            | ((reason: any) => TResult | PromiseLike<TResult>)
            | null
            | undefined,
        ): Promise<QueryResult<never> | TResult> {
          throw new Error("Function not implemented.");
        },
        finally: function (
          onFinally?: (() => void) | null | undefined,
        ): Promise<QueryResult<never>> {
          throw new Error("Function not implemented.");
        },
        then: function <TResult1 = QueryResult<never>, TResult2 = never>(
          onFulfilled?:
            | ((value: QueryResult<never>) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
          onRejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined,
        ): Promise<TResult1 | TResult2> {
          throw new Error("Function not implemented.");
        },
        [Symbol.toStringTag]: "",
        getSQL: function (): SQL {
          throw new Error("Function not implemented.");
        },
      });

      await expect(storage.deleteContactMessage(1)).resolves.toBeUndefined();
    });
  });
});
