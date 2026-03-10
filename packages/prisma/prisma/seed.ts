import { PrismaClient, Role } from "../generated/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash("Admin@123", 12);
  const hashedParentPassword = await bcrypt.hash("Parent@123", 12);
  const hashedStaffPassword = await bcrypt.hash("Staff@123", 12);

  // ============================================
  // Create Users
  // ============================================
  console.log("Creating users...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@smartcanteen.com" },
    update: {},
    create: {
      email: "admin@smartcanteen.com",
      phone: "+84901234567",
      passwordHash: hashedAdminPassword,
      name: "Admin User",
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@smartcanteen.com" },
    update: {},
    create: {
      email: "manager@smartcanteen.com",
      phone: "+84901234568",
      passwordHash: hashedAdminPassword,
      name: "Manager User",
      role: Role.MANAGER,
      isActive: true,
      isVerified: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@smartcanteen.com" },
    update: {},
    create: {
      email: "staff@smartcanteen.com",
      phone: "+84901234569",
      passwordHash: hashedStaffPassword,
      name: "Staff User",
      role: Role.STAFF,
      isActive: true,
      isVerified: true,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {},
    create: {
      email: "parent@example.com",
      phone: "+84912345678",
      passwordHash: hashedParentPassword,
      name: "Nguyễn Văn A",
      role: Role.PARENT,
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`✅ Created users: Admin, Manager, Staff, Parent`);

  // ============================================
  // Create Wallets
  // ============================================
  console.log("Creating wallets...");

  await prisma.wallet.upsert({
    where: { userId: parent.id },
    update: {},
    create: {
      userId: parent.id,
      balance: 500000, // 500k VND initial balance
    },
  });

  console.log(`✅ Created wallet for Parent with 500,000 VND`);

  // ============================================
  // Create Students
  // ============================================
  console.log("Creating students...");

  const student1 = await prisma.student.create({
    data: {
      name: "Nguyễn Văn B",
      grade: "Grade 10A",
      school: "THPT Lê Hồng Phong",
      cardNumber: "CARD001",
      parentId: parent.id,
      isActive: true,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "Nguyễn Thị C",
      grade: "Grade 8B",
      school: "THCS Trần Phú",
      cardNumber: "CARD002",
      parentId: parent.id,
      isActive: true,
    },
  });

  console.log(`✅ Created students: ${student1.name}, ${student2.name}`);

  // ============================================
  // Create Categories
  // ============================================
  console.log("Creating categories...");

  const breakfastCategory = await prisma.category.create({
    data: {
      name: "Bữa Sáng",
      slug: "bua-sang",
      description: "Các món ăn sáng dinh dưỡng",
      isActive: true,
      sortOrder: 1,
    },
  });

  const lunchCategory = await prisma.category.create({
    data: {
      name: "Cơm Trưa",
      slug: "com-trua",
      description: "Suất cơm trưa cho học sinh",
      isActive: true,
      sortOrder: 2,
    },
  });

  const snackCategory = await prisma.category.create({
    data: {
      name: "Đồ Ăn Vặt",
      slug: "do-an-vat",
      description: "Các món ăn vặt, bánh kẹo",
      isActive: true,
      sortOrder: 3,
    },
  });

  const drinkCategory = await prisma.category.create({
    data: {
      name: "Nước Uống",
      slug: "nuoc-uong",
      description: "Nước giải khát, sữa",
      isActive: true,
      sortOrder: 4,
    },
  });

  console.log(`✅ Created categories: Breakfast, Lunch, Snacks, Drinks`);

  // ============================================
  // Create Supplier
  // ============================================
  console.log("Creating supplier...");

  const supplier = await prisma.supplier.create({
    data: {
      name: "Công ty TNHH Thực phẩm An Toàn",
      email: "contact@supplier.com",
      phone: "+84909876543",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      isActive: true,
    },
  });

  console.log(`✅ Created supplier: ${supplier.name}`);

  // ============================================
  // Create Products
  // ============================================
  console.log("Creating products...");

  await prisma.product.createMany({
    data: [
      // Breakfast
      {
        name: "Bánh Mì Thịt",
        slug: "banh-mi-thit",
        description: "Bánh mì với thịt nguội, pate, rau",
        price: 20000,
        stock: 100,
        categoryId: breakfastCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 15,
      },
      {
        name: "Phở Bò",
        slug: "pho-bo",
        description: "Phở bò nóng hổi",
        price: 35000,
        stock: 50,
        categoryId: breakfastCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 450,
        protein: 25,
        carbs: 60,
        fat: 12,
      },
      {
        name: "Xôi Gà",
        slug: "xoi-ga",
        description: "Xôi với thịt gà xé",
        price: 25000,
        stock: 80,
        categoryId: breakfastCategory.id,
        supplierId: supplier.id,
        isActive: true,
        calories: 400,
        protein: 18,
        carbs: 55,
        fat: 10,
      },

      // Lunch
      {
        name: "Cơm Sườn",
        slug: "com-suon",
        description: "Cơm sườn nướng với rau củ",
        price: 40000,
        stock: 100,
        categoryId: lunchCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 650,
        protein: 28,
        carbs: 75,
        fat: 22,
      },
      {
        name: "Cơm Gà",
        slug: "com-ga",
        description: "Cơm gà chiên nước mắm",
        price: 38000,
        stock: 100,
        categoryId: lunchCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 600,
        protein: 30,
        carbs: 70,
        fat: 18,
      },
      {
        name: "Cơm Cá",
        slug: "com-ca",
        description: "Cơm cá kho tộ",
        price: 42000,
        stock: 80,
        categoryId: lunchCategory.id,
        supplierId: supplier.id,
        isActive: true,
        calories: 580,
        protein: 32,
        carbs: 68,
        fat: 16,
      },

      // Snacks
      {
        name: "Bánh Bông Lan Trứng Muối",
        slug: "banh-bong-lan-trung-muoi",
        description: "Bánh bông lan thơm ngon",
        price: 15000,
        stock: 150,
        categoryId: snackCategory.id,
        supplierId: supplier.id,
        isActive: true,
        calories: 250,
        protein: 5,
        carbs: 35,
        fat: 10,
      },
      {
        name: "Kẹo Dẻo Trái Cây",
        slug: "keo-deo-trai-cay",
        description: "Kẹo dẻo nhiều vị",
        price: 10000,
        stock: 200,
        categoryId: snackCategory.id,
        supplierId: supplier.id,
        isActive: true,
        calories: 180,
        protein: 1,
        carbs: 45,
        fat: 0,
      },

      // Drinks
      {
        name: "Sữa Tươi",
        slug: "sua-tuoi",
        description: "Sữa tươi không đường",
        price: 12000,
        stock: 200,
        categoryId: drinkCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 120,
        protein: 8,
        carbs: 12,
        fat: 5,
      },
      {
        name: "Nước Cam Ép",
        slug: "nuoc-cam-ep",
        description: "Nước cam tươi ép",
        price: 18000,
        stock: 100,
        categoryId: drinkCategory.id,
        supplierId: supplier.id,
        isActive: true,
        isFeatured: true,
        calories: 110,
        protein: 2,
        carbs: 26,
        fat: 0,
      },
      {
        name: "Trà Đào",
        slug: "tra-dao",
        description: "Trà đào cam sả",
        price: 20000,
        stock: 80,
        categoryId: drinkCategory.id,
        supplierId: supplier.id,
        isActive: true,
        calories: 90,
        protein: 0,
        carbs: 22,
        fat: 0,
      },
    ],
  });

  console.log(`✅ Created 11 products across 4 categories`);

  // ============================================
  // Create School
  // ============================================
  console.log("Creating school...");

  await prisma.school.create({
    data: {
      name: "THPT Lê Hồng Phong",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      phone: "+84908765432",
      email: "lehongphong@school.edu.vn",
      isActive: true,
    },
  });

  console.log(`✅ Created school`);

  console.log("\n✨ Database seeded successfully!");
  console.log("\n📝 Default Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin (CMS):");
  console.log("  Email: admin@smartcanteen.com");
  console.log("  Password: Admin@123");
  console.log("");
  console.log("Manager (CMS):");
  console.log("  Email: manager@smartcanteen.com");
  console.log("  Password: Admin@123");
  console.log("");
  console.log("Staff (CMS):");
  console.log("  Email: staff@smartcanteen.com");
  console.log("  Password: Staff@123");
  console.log("");
  console.log("Parent (Client App):");
  console.log("  Email: parent@example.com");
  console.log("  Password: Parent@123");
  console.log("  Wallet Balance: 500,000 VND");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
