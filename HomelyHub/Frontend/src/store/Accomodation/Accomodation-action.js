import { accomodationActions } from "./Accomodation-slice";
import {axiosInstance} from "../../utils/axios";

export const createAccomodation = (accomodationData) => async (dispatch) => {
    try {
        dispatch(accomodationActions.getAccomodationRequest());
        const response = await axiosInstance.post("/v1/rent/user/newAccommodation", accomodationData);
        if (!response) {
            throw new Error("Could not create accomodation");
        }
        // Dispatch success action or refresh accomodations
        dispatch(getAccomodation());
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred";
        dispatch(accomodationActions.getErrors(errorMessage));
    }
}


export const getAccomodation = () => async (dispatch) => {
    try {
        dispatch(accomodationActions.getAccomodationRequest());
        const { data } = await axiosInstance.get("/v1/rent/user/myAccommodation");
        const accom = data.data;
        dispatch(accomodationActions.getAccomodation(accom));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred";
        dispatch(accomodationActions.getErrors(errorMessage));
    }
}

// Alias for backward compatibility
export const getAllAccomodation = getAccomodation;