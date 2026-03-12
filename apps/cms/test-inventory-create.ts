import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testInventoryCreate() {
  try {
    console.log("Testing InventoryTransaction create...");

    // Check if inventoryTransaction exists
    console.log(
      "Available models:",
      Object.keys(prisma).filter(
        (k) => typeof (prisma as any)[k] === "object" && !k.startsWith("_"),
      ),
    );

    console.log(
      "\nChecking inventoryTransaction:",
      typeof (prisma as any).inventoryTransaction,
    );

    if ((prisma as any).inventoryTransaction) {
      console.log("✓ inventoryTransaction model exists!");

      // Test create method exists
      console.log(
        "create method:",
        typeof (prisma as any).inventoryTransaction.create,
      );

      // Try to get first product
      const product = await prisma.product.findFirst({
        where: { isActive: true },
      });

      if (product) {
        console.log("\nFound product:", product.id, product.name);
        console.log("Current stock:", product.stock);

        // Try to create inventory transaction
        console.log("\nAttempting to create inventory transaction...");
        const transaction = await (prisma as any).inventoryTransaction.create({
          data: {
            productId: product.id,
            quantity: 5,
            type: "IN",
            reason: "Test inventory",
            performedBy: 22, // Admin user ID
          },
        });

        console.log("✓ Transaction created:", transaction);

        // Clean up - delete test transaction
        await (prisma as any).inventoryTransaction.delete({
          where: { id: transaction.id },
        });
        console.log("✓ Test transaction deleted");
      } else {
        console.log("No active products found for testing");
      }
    } else {
      console.log("✗ inventoryTransaction model NOT found!");
      console.log(
        "This means Prisma client was not generated with InventoryTransaction model",
      );
    }
  } catch (error: any) {
    console.error("Test failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testInventoryCreate();
