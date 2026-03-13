import { WalletController } from "../../src/wallet/wallet.controller";
import { WalletService } from "../../src/wallet/wallet.service";

describe("WalletController", () => {
  let controller: WalletController;
  let service: jest.Mocked<WalletService>;

  beforeEach(() => {
    service = {
      getWallet: jest.fn(),
      getTransactions: jest.fn(),
    } as unknown as jest.Mocked<WalletService>;

    controller = new WalletController(service);
  });

  it("getWallet should call service", async () => {
    service.getWallet.mockResolvedValue({ id: 1, balance: 100 } as any);

    await expect(controller.getWallet({ id: 1 })).resolves.toEqual({
      id: 1,
      balance: 100,
    });
    expect(service.getWallet).toHaveBeenCalledWith(1);
  });

  it("getTransactions should call service", async () => {
    const query = { page: 1, limit: 10 } as any;
    service.getTransactions.mockResolvedValue({ data: [], meta: {} } as any);

    await expect(controller.getTransactions({ id: 2 }, query)).resolves.toEqual(
      {
        data: [],
        meta: {},
      },
    );
    expect(service.getTransactions).toHaveBeenCalledWith(2, query);
  });
});
