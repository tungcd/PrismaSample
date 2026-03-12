import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.student.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.school.deleteMany();
  await prisma.topUpRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("123456", 10);

  // ==================== USERS ====================
  console.log("👤 Creating users...");

  const admin = await prisma.user.create({
    data: {
      email: "admin@smartcanteen.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      name: "Admin User",
      phone: "0900000001",
      isActive: true,
      isVerified: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@smartcanteen.com",
      passwordHash: hashedPassword,
      role: "MANAGER",
      name: "Manager User",
      phone: "0900000002",
      isActive: true,
      isVerified: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@smartcanteen.com",
      passwordHash: hashedPassword,
      role: "STAFF",
      name: "Staff User",
      phone: "0900000003",
      isActive: true,
      isVerified: true,
    },
  });

  // Parent users with wallets
  const parents = await Promise.all([
    prisma.user.create({
      data: {
        email: "parent1@gmail.com",
        passwordHash: hashedPassword,
        role: "PARENT",
        name: "Nguyễn Văn An",
        phone: "0901234567",
        isActive: true,
        isVerified: true,
        wallet: {
          create: {
            balance: 500000,
            isLocked: false,
          },
        },
      },
      include: { wallet: true },
    }),
    prisma.user.create({
      data: {
        email: "parent2@gmail.com",
        passwordHash: hashedPassword,
        role: "PARENT",
        name: "Trần Thị Bình",
        phone: "0907654321",
        isActive: true,
        isVerified: true,
        wallet: {
          create: {
            balance: 750000,
            isLocked: false,
          },
        },
      },
      include: { wallet: true },
    }),
    prisma.user.create({
      data: {
        email: "parent3@gmail.com",
        passwordHash: hashedPassword,
        role: "PARENT",
        name: "Lê Văn Cường",
        phone: "0909876543",
        isActive: true,
        isVerified: true,
        wallet: {
          create: {
            balance: 1000000,
            isLocked: false,
          },
        },
      },
      include: { wallet: true },
    }),
    prisma.user.create({
      data: {
        email: "parent4@gmail.com",
        passwordHash: hashedPassword,
        role: "PARENT",
        name: "Phạm Thị Dung",
        phone: "0903456789",
        isActive: true,
        isVerified: true,
        wallet: {
          create: {
            balance: 250000,
            isLocked: false,
          },
        },
      },
      include: { wallet: true },
    }),
  ]);

  console.log(`✅ Created ${parents.length + 3} users`);

  // ==================== SCHOOLS ====================
  console.log("🏫 Creating schools...");

  const schools = await Promise.all([
    prisma.school.create({
      data: {
        name: "THCS Nguyễn Du",
        address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
        phone: "0281234567",
        isActive: true,
      },
    }),
    prisma.school.create({
      data: {
        name: "THPT Lê Quý Đôn",
        address: "456 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
        phone: "0287654321",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${schools.length} schools`);

  // ==================== STUDENTS ====================
  console.log("🎓 Creating students...");

  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: "Nguyễn Minh Anh",
        grade: "6A",
        school: schools[0].name,
        cardNumber: "SC001001",
        isActive: true,
        parentId: parents[0].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Trần Hoàng Bảo",
        grade: "7B",
        school: schools[0].name,
        cardNumber: "SC001002",
        isActive: true,
        parentId: parents[0].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Lê Thị Cẩm",
        grade: "8C",
        school: schools[0].name,
        cardNumber: "SC001003",
        isActive: true,
        parentId: parents[1].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Phạm Văn Dương",
        grade: "9A",
        school: schools[0].name,
        cardNumber: "SC001004",
        isActive: true,
        parentId: parents[2].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Hoàng Thị Em",
        grade: "10A",
        school: schools[1].name,
        cardNumber: "SC002001",
        isActive: true,
        parentId: parents[2].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Võ Minh Phong",
        grade: "11B",
        school: schools[1].name,
        cardNumber: "SC002002",
        isActive: true,
        parentId: parents[3].id,
      },
    }),
    prisma.student.create({
      data: {
        name: "Đặng Thị Giang",
        grade: "12C",
        school: schools[1].name,
        cardNumber: "SC002003",
        isActive: false, // Inactive student
        parentId: parents[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${students.length} students`);

  // ==================== CATEGORIES ====================
  console.log("📂 Creating categories...");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Cơm",
        slug: "com",
        description: "Các món cơm phổ biến",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Phở",
        slug: "pho",
        description: "Phở bò, phở gà truyền thống",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Bún",
        slug: "bun",
        description: "Bún chả, bún bò, bún riêu",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Đồ uống",
        slug: "do-uong",
        description: "Nước ngọt, trà sữa, nước ép",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Ăn vặt",
        slug: "an-vat",
        description: "Bánh mì, xôi, chè",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ==================== SUPPLIERS ====================
  console.log("🏭 Creating suppliers...");

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Nhà cung cấp Thực phẩm An Khang",
        phone: "0281111111",
        email: "ankhang@supplier.com",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Công ty TNHH Thực phẩm Bình Minh",
        phone: "0282222222",
        email: "binhminh@supplier.com",
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // ==================== PRODUCTS ====================
  console.log("🍽️ Creating products...");

  const products = await Promise.all([
    // Cơm
    prisma.product.create({
      data: {
        name: "Cơm gà xối mỡ",
        slug: "com-ga-xoi-mo",
        description: "Cơm gà thơm ngon với nước sốt đặc biệt",
        price: 35000,
        stock: 50,
        images: [],
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: true,
        calories: 550,
        protein: 25,
        carbs: 60,
        fat: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cơm sườn bì chả",
        slug: "com-suon-bi-cha",
        description: "Cơm với sườn nướng, bì và chả",
        price: 40000,
        stock: 40,
        images: [],
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: true,
        calories: 650,
        protein: 30,
        carbs: 70,
        fat: 20,
      },
    }),
    // Phở
    prisma.product.create({
      data: {
        name: "Phở bò tái",
        slug: "pho-bo-tai",
        description: "Phở bò truyền thống với thịt tái",
        price: 45000,
        stock: 30,
        images: [],
        categoryId: categories[1].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: false,
        calories: 450,
        protein: 28,
        carbs: 55,
        fat: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: "Phở gà",
        slug: "pho-ga",
        description: "Phở gà thơm ngon bổ dưỡng",
        price: 40000,
        stock: 35,
        images: [],
        categoryId: categories[1].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: false,
        calories: 400,
        protein: 25,
        carbs: 50,
        fat: 10,
      },
    }),
    // Bún
    prisma.product.create({
      data: {
        name: "Bún chả Hà Nội",
        slug: "bun-cha-ha-noi",
        description: "Bún chả truyền thống Hà Nội",
        price: 38000,
        stock: 25,
        images: [],
        categoryId: categories[2].id,
        supplierId: suppliers[1].id,
        isActive: true,
        isFeatured: true,
        calories: 480,
        protein: 22,
        carbs: 58,
        fat: 14,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bún bò Huế",
        slug: "bun-bo-hue",
        description: "Bún bò Huế cay nồng đặc trưng",
        price: 42000,
        stock: 20,
        images: [],
        categoryId: categories[2].id,
        supplierId: suppliers[1].id,
        isActive: true,
        isFeatured: false,
        calories: 520,
        protein: 26,
        carbs: 62,
        fat: 16,
      },
    }),
    // Đồ uống
    prisma.product.create({
      data: {
        name: "Trà sữa truyền thống",
        slug: "tra-sua-truyen-thong",
        description: "Trà sữa ngọt ngào, béo ngậy",
        price: 25000,
        stock: 100,
        images: [],
        categoryId: categories[3].id,
        supplierId: suppliers[1].id,
        isActive: true,
        isFeatured: false,
        calories: 280,
        protein: 5,
        carbs: 45,
        fat: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: "Nước ép cam tươi",
        slug: "nuoc-ep-cam-tuoi",
        description: "Nước ép cam 100% tươi nguyên chất",
        price: 20000,
        stock: 80,
        images: [],
        categoryId: categories[3].id,
        supplierId: suppliers[1].id,
        isActive: true,
        isFeatured: true,
        calories: 120,
        protein: 2,
        carbs: 28,
        fat: 0,
      },
    }),
    // Ăn vặt
    prisma.product.create({
      data: {
        name: "Bánh mì thịt",
        slug: "banh-mi-thit",
        description: "Bánh mì Việt Nam với thịt và rau",
        price: 18000,
        stock: 60,
        images: [],
        categoryId: categories[4].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: false,
        calories: 350,
        protein: 15,
        carbs: 48,
        fat: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: "Xôi xéo",
        slug: "xoi-xeo",
        description: "Xôi xéo thơm ngon với đậu xanh",
        price: 15000,
        stock: 45,
        images: [],
        categoryId: categories[4].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: false,
        calories: 320,
        protein: 8,
        carbs: 55,
        fat: 10,
      },
    }),
    // Out of stock product
    prisma.product.create({
      data: {
        name: "Cơm chiên dương châu",
        slug: "com-chien-duong-chau",
        description: "Cơm chiên với tôm, trứng và rau củ",
        price: 38000,
        stock: 0, // Out of stock
        images: [],
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
        isFeatured: false,
        calories: 580,
        protein: 20,
        carbs: 68,
        fat: 18,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // ==================== ORDERS ====================
  console.log("🛒 Creating sample orders...");

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD${Date.now()}001`,
      userId: parents[0].id,
      studentId: students[0].id,
      status: "COMPLETED",
      paymentStatus: "PAID",
      total: 95000,
      paymentMethod: "WALLET",
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      items: {
        create: [
          {
            productId: products[0].id, // Cơm gà
            quantity: 1,
            price: 35000,
          },
          {
            productId: products[2].id, // Phở bò
            quantity: 1,
            price: 45000,
          },
          {
            productId: products[6].id, // Trà sữa
            quantity: 1,
            price: 25000,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD${Date.now()}002`,
      userId: parents[1].id,
      studentId: students[2].id,
      status: "PENDING",
      paymentStatus: "PAID",
      total: 78000,
      paymentMethod: "WALLET",
      items: {
        create: [
          {
            productId: products[1].id, // Cơm sườn
            quantity: 1,
            price: 40000,
          },
          {
            productId: products[4].id, // Bún chả
            quantity: 1,
            price: 38000,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD${Date.now()}003`,
      userId: parents[2].id,
      studentId: students[3].id,
      status: "PREPARING",
      paymentStatus: "PAID",
      total: 60000,
      paymentMethod: "WALLET",
      items: {
        create: [
          {
            productId: products[3].id, // Phở gà
            quantity: 1,
            price: 40000,
          },
          {
            productId: products[7].id, // Nước ép cam
            quantity: 1,
            price: 20000,
          },
        ],
      },
    },
  });

  console.log("✅ Created 3 sample orders");

  // ==================== TRANSACTIONS ====================
  console.log("💰 Creating wallet transactions...");

  for (const parent of parents) {
    if (parent.wallet) {
      await prisma.transaction.create({
        data: {
          walletId: parent.wallet.id,
          type: "TOP_UP",
          amount: parent.wallet.balance,
          balanceBefore: 0,
          balanceAfter: parent.wallet.balance,
          description: "Nạp tiền ban đầu",
        },
      });
    }
  }

  console.log("✅ Created wallet transactions");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: ${parents.length + 3} (1 Admin, 1 Manager, 1 Staff, ${parents.length} Parents)`);
  console.log(`   - Schools: ${schools.length}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Orders: 3`);
  console.log("\n🔑 Login credentials:");
  console.log("   Admin:   admin@smartcanteen.com / 123456");
  console.log("   Manager: manager@smartcanteen.com / 123456");
  console.log("   Staff:   staff@smartcanteen.com / 123456");
  console.log("   Parents: parent1@gmail.com / 123456");
  console.log("            parent2@gmail.com / 123456");
  console.log("            parent3@gmail.com / 123456");
  console.log("            parent4@gmail.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
