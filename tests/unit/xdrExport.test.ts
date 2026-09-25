import assert from "node:assert/strict";
import { test } from "node:test";
import { Account, Operation, Transaction } from "@stellar/stellar-sdk";
import { buildInitialEnvelope, assembleFromSimulation } from "../../lib/guard/submit.ts";

test("assembleFromSimulation correctly builds transaction without prompting for signature", async () => {
  const source = new Account("GAOBCRXTCO4ZCBNHALJUMJJ5JDXNOUZ7U6VZJX4UBTXAHQEO66IPU6PH", "12345");
  const operation = Operation.invokeContractFunction({
    contract: "CAYJZT4XH5SWDXNR7MZJCCUBIDAT2KZDDUTZ7OZQEMKCPJGD4P3X4CU7",
    function: "set_policy",
    args: [],
  });

  const { SorobanDataBuilder } = await import("@stellar/stellar-sdk");
  const simulationResult: any = {
    transactionData: new SorobanDataBuilder().build(),
    minResourceFee: "100",
  };

  // Wait, assembleFromSimulation requires SorobanDataBuilder or string.
  // Actually we don't even need to run invokeWithWallet, we can just test assembleFromSimulation directly.
  const assembled = assembleFromSimulation({
    simulation: simulationResult,
    source,
    operation,
    passphrase: "Test SDF Network ; September 2015",
    guard: null,
  });

  assert.ok(assembled.transaction);
  assert.equal(assembled.transaction.fee, "200"); // 100 base + 100 minResourceFee
  
  const xdr = assembled.transaction.toXDR();
  assert.ok(typeof xdr === "string");
  assert.ok(xdr.length > 0);
});
