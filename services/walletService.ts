import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";


export const createOrUpdateWallet = async (
    walletData: Partial<WalletType>
):Promise<ResponseType> =>{

    try {
        let walletToSave = {...walletData}

        if (walletData.image) {
            const uploadImageRes = await uploadFileToCloudinary(walletData.image, "wallets");
            if (!uploadImageRes.success) {
               return { success: false, msg: uploadImageRes.msg || "failed to uplaod wallet icon" }
            }
            
            walletToSave.image = uploadImageRes.data;
         }

        if(!walletData?.id){
            // new wallet
            walletToSave.amount = 0;
            walletToSave.totalIncome = 0;
            walletToSave.totalExpenses = 0;
            walletToSave.created = new Date();
        }

        const walletRef = walletData?.id ? doc(firestore, "wallets", walletData?.id) : doc(collection(firestore, "wallets"))
        await setDoc(walletRef, walletToSave, {merge:true})

        return {success: true, data:{...walletToSave, id: walletRef.id}}
    } catch (error : any) {
        console.log("Error:", error);
        return {success: false, msg: error?.message}
    }
}

export const deleteWallet = async (walletId: string) : Promise<ResponseType> =>{

    try {
        const walletRef = doc(firestore, "wallets", walletId);
        await deleteDoc(walletRef)
        deleteTransactionByWalletId(walletId)
        return {success: true, msg:"Delete wallet"}
    } catch (error:any) {
        return {success:false, msg:error?.message}
    }
}

export const deleteTransactionByWalletId = async (walletId: string) : Promise<ResponseType> =>{

    try {
        let hasMoreTransaction = true;
        while(hasMoreTransaction){
            const transactionQuery = query(
                collection(firestore, "transactions"),
                where("walletId", "==", walletId)
            );

            const transactionSnapShot = await getDocs(transactionQuery)
            if(transactionSnapShot.size == 0){
                hasMoreTransaction = false;
                break;
            }
            const batch = writeBatch(firestore)
            transactionSnapShot.forEach((transactionDoc)=>{
                batch.delete(transactionDoc.ref)
            })
            await batch.commit()
            console.log(`${transactionSnapShot.size} delete transactions`);
            
        }

        return {success: true, msg:"Delete transaction"}
    } catch (error:any) {
        return {success:false, msg:error?.message}
    }
}