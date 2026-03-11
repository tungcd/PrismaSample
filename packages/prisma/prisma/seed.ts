import { PrismaClient, Role } from "../generated/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper function to generate random data
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  // Create 50 parent users for testing pagination
  const firstNames = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Phan",
    "Vũ",
    "Võ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Hồ",
    "Ngô",
    "Dương",
    "Lý",
    "Mai",
    "Tạ",
    "Đinh",
    "Tô",
    "Hà",
  ];
  const middleNames = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Thanh", "Hoàng"];
  const lastNames = [
    "An",
    "Bình",
    "Cường",
    "Dũng",
    "Hiếu",
    "Hòa",
    "Hùng",
    "Khôi",
    "Long",
    "Nam",
    "Phong",
    "Quân",
    "Sơn",
    "Tài",
    "Tuấn",
    "Việt",
    "Anh",
    "Bảo",
    "Linh",
    "Mai",
    "Oanh",
    "Phương",
    "Thảo",
    "Trang",
    "Yến",
    "Chi",
    "Hương",
    "Lan",
    "Nga",
    "Nhung",
  ];

  const parents = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = randomItem(firstNames);
    const middleName = randomItem(middleNames);
    const lastName = randomItem(lastNames);
    const fullName = `${firstName} ${middleName} ${lastName}`;

    const parent = await prisma.user.upsert({
      where: { email: `parent${i}@example.com` },
      update: {},
      create: {
        email: `parent${i}@example.com`,
        phone: `+8491${String(i).padStart(7, "0")}`,
        passwordHash: hashedParentPassword,
        name: fullName,
        role: Role.PARENT,
        isActive: Math.random() > 0.1, // 90% active
        isVerified: Math.random() > 0.2, // 80% verified
      },
    });
    parents.push(parent);
  }

  console.log(
    `✅ Created ${3 + parents.length} users (Admin, Manager, Staff + ${parents.length} Parents)`,
  );

  // ============================================
  // Create Wallets for Parents
  // ============================================
  console.log("Creating wallets...");

  for (const parent of parents) {
    await prisma.wallet.upsert({
      where: { userId: parent.id },
      update: {},
      create: {
        userId: parent.id,
        balance: randomInt(0, 1000000), // Random balance 0-1M VND
      },
    });
  }

  console.log(`✅ Created ${parents.length} wallets`);

  // ============================================
  // Create Schools First
  // ============================================
  console.log("Creating schools...");

  const schoolData = [
    {
      name: "THCS Trần Phú",
      address: "123 Đường Trần Phú, Quận 1, TP.HCM",
      phone: "+84908765432",
      email: "tranphu@school.edu.vn",
    },
    {
      name: "THCS Lê Lợi",
      address: "456 Đường Lê Lợi, Quận 3, TP.HCM",
      phone: "+84908765433",
      email: "leloi@school.edu.vn",
    },
    {
      name: "THCS Nguyễn Trãi",
      address: "789 Đường Nguyễn Trãi, Quận 5, TP.HCM",
      phone: "+84908765434",
      email: "nguyentrai@school.edu.vn",
    },
    {
      name: "THCS Trần Hưng Đạo",
      address: "101 Đường Trần Hưng Đạo, Quận 10, TP.HCM",
      phone: "+84908765435",
      email: "tranhungdao@school.edu.vn",
    },
    {
      name: "THCS Quang Trung",
      address: "202 Đường Quang Trung, Quận Gò Vấp, TP.HCM",
      phone: "+84908765436",
      email: "quangtrung@school.edu.vn",
    },
    {
      name: "THCS Lý Thường Kiệt",
      address: "303 Đường Lý Thường Kiệt, Quận 11, TP.HCM",
      phone: "+84908765437",
      email: "lythuongkiet@school.edu.vn",
    },
    {
      name: "THPT Trần Phú",
      address: "404 Đường 3 Tháng 2, Quận 10, TP.HCM",
      phone: "+84908765438",
      email: "thpt.tranphu@school.edu.vn",
    },
    {
      name: "THPT Lê Quý Đôn",
      address: "505 Đường Lê Quý Đôn, Quận 3, TP.HCM",
      phone: "+84908765439",
      email: "lequydon@school.edu.vn",
    },
    {
      name: "THPT Nguyễn Huệ",
      address: "606 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "+84908765440",
      email: "nguyenhue@school.edu.vn",
    },
    {
      name: "THPT Chu Văn An",
      address: "707 Đường Chu Văn An, Quận Bình Thạnh, TP.HCM",
      phone: "+84908765441",
      email: "chuvanan@school.edu.vn",
    },
  ];

  const schools = [];
  for (const data of schoolData) {
    let school = await prisma.school.findFirst({
      where: { name: data.name },
    });
    if (!school) {
      school = await prisma.school.create({
        data: { ...data, isActive: true },
      });
    }
    schools.push(school);
  }

  console.log(`✅ Created ${schools.length} schools`);

  // ============================================
  // Create Students (100+ for pagination testing)
  // ============================================
  console.log("Creating students...");

  const studentFirstNames = [...firstNames];
  const studentLastNames = [...lastNames];
  const grades = [
    "6A",
    "6B",
    "6C",
    "7A",
    "7B",
    "7C",
    "8A",
    "8B",
    "8C",
    "9A",
    "9B",
    "9C",
    "10A",
    "10B",
    "10C",
    "11A",
    "11B",
    "11C",
    "12A",
    "12B",
    "12C",
  ];

  const students = [];
  for (let i = 1; i <= 120; i++) {
    const firstName = randomItem(studentFirstNames);
    const middleName = randomItem(middleNames);
    const lastName = randomItem(studentLastNames);
    const fullName = `${firstName} ${middleName} ${lastName}`;
    const grade = randomItem(grades);
    const school = randomItem(schools);
    const parent = randomItem(parents);

    const student = await prisma.student.create({
      data: {
        name: fullName,
        grade: grade,
        school: school.name,
        cardNumber: `SC${String(i).padStart(6, "0")}`, // SC000001, SC000002, ...
        parentId: parent.id,
        isActive: Math.random() > 0.05, // 95% active
      },
    });
    students.push(student);
  }

  console.log(`✅ Created ${students.length} students`);

  // ============================================
  // Create Categories
  // ============================================
  console.log("Creating categories...");

  const breakfastCategory = await prisma.category.upsert({
    where: { slug: "bua-sang" },
    update: {},
    create: {
      name: "Bữa Sáng",
      slug: "bua-sang",
      description: "Các món ăn sáng dinh dưỡng",
      isActive: true,
      sortOrder: 1,
    },
  });

  const lunchCategory = await prisma.category.upsert({
    where: { slug: "com-trua" },
    update: {},
    create: {
      name: "Cơm Trưa",
      slug: "com-trua",
      description: "Suất cơm trưa cho học sinh",
      isActive: true,
      sortOrder: 2,
    },
  });

  const snackCategory = await prisma.category.upsert({
    where: { slug: "do-an-vat" },
    update: {},
    create: {
      name: "Đồ Ăn Vặt",
      slug: "do-an-vat",
      description: "Các món ăn vặt, bánh kẹo",
      isActive: true,
      sortOrder: 3,
    },
  });

  const drinkCategory = await prisma.category.upsert({
    where: { slug: "nuoc-uong" },
    update: {},
    create: {
      name: "Nước Uống",
      slug: "nuoc-uong",
      description: "Nước giải khát, sữa",
      isActive: true,
      sortOrder: 4,
    },
  });

  console.log(`✅ Created 4 categories`);

  // ============================================
  // Create Suppliers
  // ============================================
  console.log("Creating suppliers...");

  const supplierData = [
    {
      name: "Công ty TNHH Thực phẩm An Toàn",
      email: "contact@supplier.com",
      phone: "+84909876543",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    {
      name: "Fresh Food Việt Nam",
      email: "info@freshfood.vn",
      phone: "+84909876544",
      address: "456 Đường DEF, Quận 3, TP.HCM",
    },
    {
      name: "Organic Food Distribution",
      email: "sales@organic.vn",
      phone: "+84909876545",
      address: "789 Đường GHI, Quận 5, TP.HCM",
    },
  ];

  const suppliers = [];
  for (const data of supplierData) {
    let supplier = await prisma.supplier.findFirst({
      where: { name: data.name },
    });
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { ...data, isActive: true },
      });
    }
    suppliers.push(supplier);
  }

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // ============================================
  // Create Products (30+ items for pagination testing)
  // ============================================
  console.log("Creating products...");

  const breakfastProducts = [
    {
      name: "Bánh Mì Thịt",
      slug: "banh-mi-thit",
      desc: "Bánh mì với thịt nguội, pate, rau",
      price: 20000,
      cal: 350,
      pro: 12,
      carb: 45,
      fat: 15,
    },
    {
      name: "Phở Bò",
      slug: "pho-bo",
      desc: "Phở bò nóng hổi",
      price: 35000,
      cal: 450,
      pro: 25,
      carb: 60,
      fat: 12,
    },
    {
      name: "Xôi Gà",
      slug: "xoi-ga",
      desc: "Xôi với thịt gà xé",
      price: 25000,
      cal: 400,
      pro: 18,
      carb: 55,
      fat: 10,
    },
    {
      name: "Bún Bò Huế",
      slug: "bun-bo-hue",
      desc: "Bún bò Huế cay nồng",
      price: 38000,
      cal: 500,
      pro: 22,
      carb: 65,
      fat: 14,
    },
    {
      name: "Bánh Cuốn",
      slug: "banh-cuon",
      desc: "Bánh cuốn nhân thịt",
      price: 28000,
      cal: 320,
      pro: 14,
      carb: 50,
      fat: 8,
    },
    {
      name: "Hủ Tiếu",
      slug: "hu-tieu",
      desc: "Hủ tiếu Nam Vang",
      price: 32000,
      cal: 420,
      pro: 20,
      carb: 58,
      fat: 11,
    },
    {
      name: "Cháo Gà",
      slug: "chao-ga",
      desc: "Cháo gà dinh dưỡng",
      price: 22000,
      cal: 280,
      pro: 16,
      carb: 48,
      fat: 6,
    },
    {
      name: "Bánh Mì Chả Cá",
      slug: "banh-mi-cha-ca",
      desc: "Bánh mì chả cá Nha Trang",
      price: 25000,
      cal: 360,
      pro: 15,
      carb: 48,
      fat: 12,
    },
  ];

  const lunchProducts = [
    {
      name: "Cơm Sườn",
      slug: "com-suon",
      desc: "Cơm sườn nướng với rau củ",
      price: 40000,
      cal: 650,
      pro: 28,
      carb: 75,
      fat: 22,
    },
    {
      name: "Cơm Gà",
      slug: "com-ga",
      desc: "Cơm gà chiên nước mắm",
      price: 38000,
      cal: 600,
      pro: 30,
      carb: 70,
      fat: 18,
    },
    {
      name: "Cơm Cá",
      slug: "com-ca",
      desc: "Cơm cá kho tộ",
      price: 42000,
      cal: 580,
      pro: 32,
      carb: 68,
      fat: 16,
    },
    {
      name: "Cơm Bò",
      slug: "com-bo",
      desc: "Cơm bò xào rau",
      price: 45000,
      cal: 620,
      pro: 35,
      carb: 72,
      fat: 20,
    },
    {
      name: "Cơm Tấm",
      slug: "com-tam",
      desc: "Cơm tấm sườn bì chả",
      price: 42000,
      cal: 680,
      pro: 26,
      carb: 78,
      fat: 24,
    },
    {
      name: "Cơm Chiên",
      slug: "com-chien",
      desc: "Cơm chiên dương châu",
      price: 35000,
      cal: 550,
      pro: 18,
      carb: 75,
      fat: 16,
    },
    {
      name: "Cơm Hến",
      slug: "com-hen",
      desc: "Cơm hến Huế",
      price: 30000,
      cal: 480,
      pro: 22,
      carb: 65,
      fat: 12,
    },
    {
      name: "Cơm Gà Xối Mỡ",
      slug: "com-ga-xoi-mo",
      desc: "Cơm gà Hội An",
      price: 40000,
      cal: 640,
      pro: 30,
      carb: 70,
      fat: 22,
    },
    {
      name: "Cơm Rang",
      slug: "com-rang",
      desc: "Cơm rang trứng",
      price: 28000,
      cal: 520,
      pro: 15,
      carb: 72,
      fat: 14,
    },
  ];

  const snackProducts = [
    {
      name: "Bánh Bông Lan Trứng Muối",
      slug: "banh-bong-lan-trung-muoi",
      desc: "Bánh bông lan thơm ngon",
      price: 15000,
      cal: 250,
      pro: 5,
      carb: 35,
      fat: 10,
    },
    {
      name: "Kẹo Dẻo Trái Cây",
      slug: "keo-deo-trai-cay",
      desc: "Kẹo dẻo nhiều vị",
      price: 10000,
      cal: 180,
      pro: 1,
      carb: 45,
      fat: 0,
    },
    {
      name: "Bánh Quy Bơ",
      slug: "banh-quy-bo",
      desc: "Bánh quy bơ giòn tan",
      price: 12000,
      cal: 220,
      pro: 3,
      carb: 30,
      fat: 9,
    },
    {
      name: "Snack Khoai Tây",
      slug: "snack-khoai-tay",
      desc: "Snack khoai tây chiên",
      price: 8000,
      cal: 160,
      pro: 2,
      carb: 20,
      fat: 8,
    },
    {
      name: "Socola",
      slug: "socola",
      desc: "Socola sữa thơm ngon",
      price: 15000,
      cal: 240,
      pro: 3,
      carb: 28,
      fat: 12,
    },
    {
      name: "Kẹo Mút",
      slug: "keo-mut",
      desc: "Kẹo mút nhiều màu",
      price: 5000,
      cal: 100,
      pro: 0,
      carb: 25,
      fat: 0,
    },
    {
      name: "Bánh Tráng Trộn",
      slug: "banh-trang-tron",
      desc: "Bánh tráng trộn cay",
      price: 15000,
      cal: 180,
      pro: 4,
      carb: 32,
      fat: 5,
    },
  ];

  const drinkProducts = [
    {
      name: "Sữa Tươi",
      slug: "sua-tuoi",
      desc: "Sữa tươi không đường",
      price: 12000,
      cal: 120,
      pro: 8,
      carb: 12,
      fat: 5,
    },
    {
      name: "Nước Cam Ép",
      slug: "nuoc-cam-ep",
      desc: "Nước cam tươi ép",
      price: 18000,
      cal: 110,
      pro: 2,
      carb: 26,
      fat: 0,
    },
    {
      name: "Trà Đào",
      slug: "tra-dao",
      desc: "Trà đào cam sả",
      price: 20000,
      cal: 90,
      pro: 0,
      carb: 22,
      fat: 0,
    },
    {
      name: "Nước Dừa",
      slug: "nuoc-dua",
      desc: "Nước dừa tươi mát",
      price: 15000,
      cal: 80,
      pro: 1,
      carb: 19,
      fat: 0,
    },
    {
      name: "Trà Sữa",
      slug: "tra-sua",
      desc: "Trà sữa trân châu",
      price: 25000,
      cal: 320,
      pro: 6,
      carb: 58,
      fat: 8,
    },
    {
      name: "Sinh Tố Bơ",
      slug: "sinh-to-bo",
      desc: "Sinh tố bơ sữa",
      price: 22000,
      cal: 280,
      pro: 5,
      carb: 35,
      fat: 12,
    },
    {
      name: "Nước Ép Dưa Hấu",
      slug: "nuoc-ep-dua-hau",
      desc: "Nước ép dưa hấu mát",
      price: 16000,
      cal: 95,
      pro: 1,
      carb: 24,
      fat: 0,
    },
    {
      name: "Cà Phê Sữa",
      slug: "ca-phe-sua",
      desc: "Cà phê sữa đá",
      price: 18000,
      cal: 180,
      pro: 4,
      carb: 28,
      fat: 6,
    },
  ];

  const allProducts = [];

  for (const p of breakfastProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        stock: randomInt(50, 200),
        categoryId: breakfastCategory.id,
        supplierId: randomItem(suppliers).id,
        isActive: Math.random() > 0.1,
        isFeatured: Math.random() > 0.7,
        calories: p.cal,
        protein: p.pro,
        carbs: p.carb,
        fat: p.fat,
      },
    });
    allProducts.push(product);
  }

  for (const p of lunchProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        stock: randomInt(50, 150),
        categoryId: lunchCategory.id,
        supplierId: randomItem(suppliers).id,
        isActive: Math.random() > 0.1,
        isFeatured: Math.random() > 0.7,
        calories: p.cal,
        protein: p.pro,
        carbs: p.carb,
        fat: p.fat,
      },
    });
    allProducts.push(product);
  }

  for (const p of snackProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        stock: randomInt(100, 300),
        categoryId: snackCategory.id,
        supplierId: randomItem(suppliers).id,
        isActive: Math.random() > 0.1,
        isFeatured: Math.random() > 0.7,
        calories: p.cal,
        protein: p.pro,
        carbs: p.carb,
        fat: p.fat,
      },
    });
    allProducts.push(product);
  }

  for (const p of drinkProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        stock: randomInt(100, 250),
        categoryId: drinkCategory.id,
        supplierId: randomItem(suppliers).id,
        isActive: Math.random() > 0.1,
        isFeatured: Math.random() > 0.7,
        calories: p.cal,
        protein: p.pro,
        carbs: p.carb,
        fat: p.fat,
      },
    });
    allProducts.push(product);
  }

  console.log(`✅ Created ${allProducts.length} products across 4 categories`);

  console.log("\n✨ Database seeded successfully!");
  console.log("\n� Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `👥 Users: ${3 + parents.length} (3 staff + ${parents.length} parents)`,
  );
  console.log(`🎓 Students: ${students.length}`);
  console.log(`🏫 Schools: ${schools.length}`);
  console.log(`📦 Products: ${allProducts.length}`);
  console.log(`🏢 Suppliers: ${suppliers.length}`);
  console.log(`💼 Categories: 4`);
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
  console.log("Parent (Client App) - Test accounts:");
  console.log("  Email: parent1@example.com ~ parent50@example.com");
  console.log("  Password: Parent@123");
  console.log("");
  console.log("🎯 Perfect for testing pagination, filtering, and sorting!");
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
