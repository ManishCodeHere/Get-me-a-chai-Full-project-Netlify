import React from "react";
import PaymentPage from "@/components/PaymentPage";
import { notFound } from "next/navigation";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Payment from "@/models/Payment"; // 👈 import your Payment model

const Username = async ({ params }) => {
  const { username } = await params;

  await connectDb();

  // ✅ Use .lean() to get plain object, not Mongoose document
  const u = await User.findOne({ username }).lean();
  if (!u) {
    notFound();
  }

  // ✅ Fetch payments here in the Server Component & serialize
  const payments = await Payment.find({ to_user: username })
    .sort({ createdAt: -1 })
    .lean();

  // ✅ Serialize everything — converts ObjectId, Date etc. to strings
  const serializedUser = JSON.parse(JSON.stringify(u));
  const serializedPayments = JSON.parse(JSON.stringify(payments));

  return (
    <>
      <PaymentPage
        username={username}
        user={serializedUser}         // ✅ pass serialized user
        payments={serializedPayments} // ✅ pass serialized payments
      />
    </>
  );
};

export default Username;

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `Support ${username} - Get Me A Chai`,
  };
}