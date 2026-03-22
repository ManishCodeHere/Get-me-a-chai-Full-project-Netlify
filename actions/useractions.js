"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"




export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()
    // fetch the secret of the user who is getting the payment
    let user = await User.findOne({ username: to_username })
    const secret = user.razorpaysecret
    var instance = new Razorpay({ key_id: user.razorpayid, key_secret: secret })

    // instance.orders.create({
    //     amount: 50000,
    //     currency: "INR",
    //     receipt: "receipt#1",
    //     notes: {
    //         key1: "value3",
    //         key2: "value2"
    //     }
    // })

    let options = {
        amount: Number.parseInt(amount),
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    // create a payment object which shows a pending payment in the database
    await Payment.create({ oid: x.id, amount: amount / 100, to_user: to_username, name: paymentform.name, message: paymentform.message })

    return x
}


export const fetchuser = async (username) => {
    await connectDb()
    let u = await User.findOne({ username: username }).lean()
    return JSON.parse(JSON.stringify(u))
}


export const fetchpayments = async (username) => {
    await connectDb()
    // find all payments sorted by dcreasing order of amount and flatten object  ids
    let p = await Payment.find({ to_user: username, done: true }).sort({ amount: -1 }).limit(10).lean()
    return JSON.parse(JSON.stringify(p))
}

export const updateProfile = async (data, oldusername) => {
    await connectDb()
    let ndata = Object.fromEntries(data)

    // If the username is being updated, chcek if username is available
     if (oldusername !== ndata.username) {
        let u = await User.findOne({ username: ndata.username })
        if (u) {
            return { error: "Username already exists" }
        }   
        await User.updateOne({email: ndata.email}, ndata)
        // Now update all the usernames in the Payments table 
        await Payment.updateMany({to_user: oldusername}, {to_user: ndata.username})
        
    }
    else{   
        await User.updateOne({email: ndata.email}, ndata)
    }

}