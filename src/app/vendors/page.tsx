import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const data = await getDashboardData();

  return (
    <ConsoleShell
      activeTab="Vendors"
      eyebrow="Vendor Registry"
      title="Keep vendor truth separate from treasury truth."
      summary="Vendors, facilitators, treasury controls, and oracles are distinct system boundaries. This page keeps the vendor layer visible without blurring those roles together."
      actions={
        <>
          <StatusPill label={`${data.vendors.length} vendors`} tone="info" />
          <StatusPill label="Primary set" tone="success" />
        </>
      }
    >
      <section className="rounded-[28px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e4ece9] text-[#64748b]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Vendor</th>
                <th className="py-3 pr-4 font-semibold">Mode</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Morph native</th>
                <th className="py-3 pr-4 font-semibold">Receipt capability</th>
                <th className="py-3 font-semibold">Adapter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f0]">
              {data.vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-[#0f1720]">
                      {vendor.name}
                    </div>
                    <div className="text-xs text-[#64748b]">{vendor.id}</div>
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">{vendor.mode}</td>
                  <td className="py-4 pr-4">
                    <StatusPill
                      label={vendor.status}
                      tone={
                        vendor.status === "available" ? "success" : "warning"
                      }
                    />
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">
                    {vendor.morphNative ? "Yes" : "No"}
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">
                    {vendor.receiptCapability ? "Yes" : "No"}
                  </td>
                  <td className="py-4 text-[#475569]">{vendor.adapterKey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleShell>
  );
}
