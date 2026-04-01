"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function WorkOrderCreatePage() {
  // GENERAL INFO
  const [customer, setCustomer] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [execDate, setExecDate] = useState("");
  const [notes, setNotes] = useState("");
  const [module, setModule] = useState("");

  // WO DETAILS
  const [truckType, setTruckType] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  const jobOrders = Array.from({ length: qty }, (_, i) => `JO-${(i + 1)
    .toString()
    .padStart(3, "0")}`);

  // SUBMIT
  const handleSubmit = async () => {
    try {
      // 1. INSERT WORK ORDER
      const { data: wo, error: woError } = await supabase
        .from("work_orders")
        .insert([
          {
            service_mode: module,
            tgl_order: orderDate,
            tgl_eksekusi: execDate,
            catatan_khusus: notes,
            total_unit_diminta: qty,
            status_wo: "DRAFT",
          },
        ])
        .select()
        .single();

      if (woError) throw woError;

      // 2. INSERT WO DETAIL (work_order_items)
      const { error: itemError } = await supabase
        .from("work_order_items")
        .insert([
          {
            wo_id: wo.id,
            jenis_truk: truckType,
            origin_id: null,
            destination_id: null,
            jumlah_unit: qty,
          },
        ]);

      if (itemError) throw itemError;

      // 3. AUTO GENERATE JOB ORDER
      const joData = Array.from({ length: qty }, (_, i) => ({
        wo_id: wo.id,
        nomor_jo: `${wo.id}-JO-${i + 1}`,
        status_jo: "DRAFT",
      }));

      const { error: joError } = await supabase
        .from("job_orders")
        .insert(joData);

      if (joError) throw joError;

      alert("Work Order & Job Orders berhasil dibuat!");
    } catch (err) {
      console.error(err);
      alert("Error saat submit");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">

        <h1 className="text-lg font-semibold">Create Work Order</h1>

        {/* GENERAL INFO */}
        <div className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="font-semibold">General Info</h2>

          <input
            className="w-full border p-2 rounded"
            placeholder="Customer Name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={execDate}
            onChange={(e) => setExecDate(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            <option value="">Select Module</option>
            <option value="TRUCKING">Trucking</option>
          </select>
        </div>

        {/* WO DETAILS */}
        {module === "TRUCKING" && (
          <div className="bg-white p-4 rounded shadow space-y-2">
            <h2 className="font-semibold">Work Order Details</h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Truck Type"
              value={truckType}
              onChange={(e) => setTruckType(e.target.value)}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <div className="flex gap-2 items-center">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="Harga Deal"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <div className="font-bold text-blue-600">
              Total: Rp {price * qty}
            </div>
          </div>
        )}

        {/* JO PREVIEW */}
        {module === "TRUCKING" && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Auto Job Orders</h2>
            {jobOrders.map((jo) => (
              <div key={jo} className="border p-2 rounded mt-1">
                {jo}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex gap-2">
        <button className="flex-1 border rounded p-2">Draft</button>
        <button
          className="flex-1 bg-blue-600 text-white rounded p-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}