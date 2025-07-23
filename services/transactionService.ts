import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async ( 
    transactionData: TransactionType
): Promise<ResponseType> => {

    try {

        const { id, walletId, amount, type, image } = transactionData;
        if (!amount || amount <= 0 || !walletId || !type) {
            return { success: false, msg: "update failed" }
        };


        let updatedTransaction: TransactionType = {
            ...transactionData,
        };
        if (id) {
            const oldTransactionsnapShot = await getDoc(doc(firestore, "transactions", id));
            const oldTransaction = oldTransactionsnapShot.data() as TransactionType;

            const shouldRevertOriginal = oldTransaction.amount != amount || oldTransaction.walletId != walletId || oldTransaction.type != type;

            if (shouldRevertOriginal) {
                let res = await revertOrUpdateWallets(oldTransaction, Number(amount), walletId, type);


                if (!res.success) return res;
            }

        } else {

            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            )

            if (!res.success) {
                return res;
            }
        }

        if (image) {
            const uploadImageRes = await uploadFileToCloudinary(image, "transactions");
            if (!uploadImageRes.success) {
                return { success: false, msg: uploadImageRes.msg || "failed to uplaod reciept" }
            }

            updatedTransaction.image = uploadImageRes.data
        } else {
            delete updatedTransaction.image;
        }



        const transactionRef = id ? doc(firestore, "transactions", id) : doc(collection(firestore, "transactions"));

        await setDoc(transactionRef, updatedTransaction, { merge: true })
        return { success: true, data: { ...transactionData, id: transactionRef.id } }
    } catch (error: any) {
        console.log("Transactional Error:", error);
        return { success: false, msg: "error creating or update transaction" }
    }
}

const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId)
        const walletSnapShot = await getDoc(walletRef)
        if (!walletSnapShot.exists()) {
            console.log("wallet doesn't exist");
            return { success: false, msg: "wallet doesn't exist" }
        }

        const walletData = walletSnapShot.data() as WalletType;

        if (type == 'expense' && walletData.amount! - amount < 0) {
            return { success: false, msg: "Selected wallet don't have enough balance." }
        }

        const updateType = type == 'income' ? "totalIncome" : "totalExpenses";
        const updatedWalletAmount = type == 'income' ? Number(walletData.amount) + amount : Number(walletData.amount) - amount;
        const updatedTotals = type == 'income' ? Number(walletData.totalIncome) + amount : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals
        })
        return { success: true }
    } catch (error: any) {
        return { success: false, msg: 'error update wallet ' }
    }
}


const revertOrUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newWalletId: string,
    newTransactionType: string,
) => {
    try {
        const originalWalletsnapShot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId))
        // console.log("originalWalletsnapShot:", originalWalletsnapShot);
        const originalWallet = originalWalletsnapShot.data() as WalletType;

        let newWalletSnapShot = await getDoc(doc(firestore, "wallets", newWalletId));
        let newWalletData = newWalletSnapShot.data() as WalletType;

        const revertType = oldTransaction.type == 'income' ? 'totalIncome' : 'totalExpenses';

        const revertIncomeExpenses: number = oldTransaction.type == 'income' ? -Number(oldTransaction.amount) : Number(oldTransaction.amount);

        const revertWalletAmount = Number(originalWallet.amount) + revertIncomeExpenses;

        const revertedIncomeExpensesAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount)

        if (newTransactionType == 'expense') {
            //if user tried to convert income to expense on the same wallet 
            // or if the user tried to increase the expense amount and don't have enought amount
            if (oldTransaction.walletId == newWalletId && revertWalletAmount < newTransactionAmount) {
                return { success: false, msg: "The selected wallet don't have enough balance" }
            }
            if (newWalletData.amount! < newTransactionAmount) {
                return { success: false, msg: "The selected wallet don't have enough balance" }
            }
        }


        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertWalletAmount,
            [revertType]: revertedIncomeExpensesAmount
        })

        /////////////////////////////////////////////////////////////////////
        newWalletSnapShot = await getDoc(doc(firestore, "wallets", newWalletId));
        newWalletData = newWalletSnapShot.data() as WalletType;


        const updateType = newTransactionType == 'income' ? 'totalIncome' : 'totalExpenses'
        const updateTransactionAmount: number = newTransactionType == 'income' ? Number(newTransactionAmount) : -Number(newTransactionAmount)

        const newWalletAmount = Number(newWalletData.amount) + updateTransactionAmount;

        const newIncomeExpensesAmount = Number(
            newWalletData[updateType]! + Number(newTransactionAmount)
        )



        await createOrUpdateWallet({
            id: newWalletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpensesAmount,
        });

        return { success: true }
    } catch (error: any) {
        console.log("Error:", error);
        return { success: false, msg: 'error update wallet ' }
    }
}

export const deleteTransaction = async (transactionId: string, walletId: string): Promise<ResponseType> => {

    try {
        const transactionRef = doc(firestore, "transactions", transactionId)
        const transactionSnapShot = await getDoc(transactionRef);
        if (!transactionSnapShot.exists()) {
            return { success: false, msg: "Transaction doesn't exist" }
        }
        const transactionData = transactionSnapShot.data() as TransactionType;

        const transactionType = transactionData?.type
        const transactionAmount = transactionData?.amount

        //wallet
        const walletSnapShot = await getDoc(doc(firestore, "wallets", walletId));
        const walletData = walletSnapShot.data() as WalletType;


        const updateType = transactionType == 'income' ? 'totalIncome' : 'totalExpenses'
        const newWalletAmount = walletData?.amount! - (transactionType == 'income' ? transactionAmount : -transactionAmount)

        const newIncomeExpensesAmount = walletData[updateType]! - transactionAmount;

        if (transactionType == 'income' && newWalletAmount < 0) {
            return { success: false, msg: "You can't delete" }
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpensesAmount
        })

        await deleteDoc(transactionRef)
        return { success: true, msg: "Delete transactions" }
    } catch (error: any) {
        return { success: false, msg: error?.message }
    }
}

export const fetchWeeklyStats = async (
    uid: string
): Promise<ResponseType> => {

    try {
        const db = firestore;
        const today = new Date()
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7);

        const transactionQuery = query(
            collection(db, "transactions"),
            where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );
        const querySnapShot = await getDocs(transactionQuery)
        const weeklyData = getLast7Days();
        const transactions: TransactionType[] = [];

        //mapping each transactin in day
        querySnapShot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction)


            const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0];
            const dayData = weeklyData.find((day) => day.date == transactionDate)

            if (dayData) {
                if (transaction.type == 'income') {
                    dayData.income += transaction.amount;
                } else if (transaction.type == 'expense') {
                    dayData.expense += transaction.amount;
                }
            }

        })

        const stats = weeklyData.flatMap((day) => [
            {
                value: day.income,
                label: day.day,
                spacing: scale(4),
                labelWidth: scale(30),
                frontColor: colors.primary,
            },
            {
                value: day.expense,
                frontColor: colors.rose,
            },
        ])

        return { success: true, data:{stats, transactions }}
    } catch (error: any) {
    console.log("Error while fetching week data:", error);
    
        return { success: false, msg: "Failed to fetch weekly transactions" }
    }
}
export const fetchMontlyStats = async (
    uid: string
): Promise<ResponseType> => {

    try {
        const db = firestore;
        const today = new Date()
        const twelvemonthAgo = new Date(today)
        twelvemonthAgo.setMonth(today.getMonth() - 12);

        const transactionQuery = query(
            collection(db, "transactions"),
            where("date", ">=", Timestamp.fromDate(twelvemonthAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );
        const querySnapShot = await getDocs(transactionQuery)
        const monthlyData = getLast12Months();
        const transactions: TransactionType[] = [];

        //mapping each transactin in day
        querySnapShot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction)


            const transactionDate = (transaction.date as Timestamp).toDate();
            const monthName = transactionDate.toLocaleString("default",{
                month:'short'
            })
            const shortYear = transactionDate.getFullYear().toString().slice(-2)
            const monthData = monthlyData.find((month)=> month.month == `${monthName} ${shortYear}`)

            if (monthData) {
                if (transaction.type === 'income') {
                    monthData.income += transaction.amount;
                } else if (transaction.type === 'expense') {
                    monthData.expense += transaction.amount;
                }
            }

        })

        const stats = monthlyData.flatMap((month) => [
            {
                value: month.income,
                label: month.month,
                spacing: scale(4),
                labelWidth: scale(46),
                frontColor: colors.primary,
            },
            {
                value: month.expense,
                frontColor: colors.rose,
            },
        ])

        return { success: true, data:{stats, transactions }}
    } catch (error: any) {
        console.log("Error while fetching month data:", error);
    
        return { success: false, msg:"Failed to fetch monthly transactions" }
    }
}
export const fetchYearlyStats = async (
    uid: string
): Promise<ResponseType> => {

    try {
        const db = firestore;
        

        const transactionQuery = query(
            collection(db, "transactions"),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );
        const querySnapShot = await getDocs(transactionQuery)
        const transactions: TransactionType[] = [];

        const firstTransactions = querySnapShot.docs.reduce((earliest, doc)=>{
            const transactionDate = doc.data().date.toDate();
            return transactionDate < earliest ? transactionDate : earliest;
        }, new Date())

        const firstYear = firstTransactions.getFullYear()
        const currentYear = new Date().getFullYear()


        const yearlyData = getYearsRange(firstYear, currentYear)

        //mapping each transactin in day
        querySnapShot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction)

            const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();
         
            const yearData = yearlyData.find(
                (item:any)=> item.year === transactionYear.toString()
            )

            if (yearData) {
                if (transaction.type === 'income') {
                    yearData.income += transaction.amount;
                } else if (transaction.type === 'expense') {
                    yearData.expense += transaction.amount;
                }
            }

        })

        const stats = yearlyData.flatMap((year:any) => [
            {
                value: year.income,
                label: year.year ,
                spacing: scale(4),
                labelWidth: scale(35),
                frontColor: colors.primary,
            },
            {
                value: year.expense,
                frontColor: colors.rose,
            },
        ])

        return { success: true, data:{stats, transactions }}
    } catch (error: any) {
        console.log("Error while fetching month data:", error);
    
        return { success: false, msg:"Failed to fetch monthly transactions" }
    }
}