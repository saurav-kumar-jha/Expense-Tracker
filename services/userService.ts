import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";


export const UpdateUser = async (
   uid: string,
   updatedData: UserDataType
): Promise<ResponseType> => {

   try {
      if (updatedData && updatedData?.image?.uri) {
         const uploadImageRes = await uploadFileToCloudinary(updatedData.image, "users");
         if (!uploadImageRes.success) {
            return { success: false, msg: uploadImageRes.msg || "failed to uplaod" }
         }

         // console.log("uload image uri: ", uploadImageRes.data);
         
         updatedData.image = uploadImageRes.data;
      }


      const userRef = doc(firestore, "users", uid);
      await updateDoc(userRef, updatedData);

      return { success: true, msg: "updated successfully." };

   } catch (error: any) {
      // console.log("Error while updating user", error);
      return { success: false, msg: error?.message };
   }
}