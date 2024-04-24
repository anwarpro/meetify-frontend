import axios from "axios";
import { MeetResponse } from "../../types/user";
import objectToParams from "../../utils/objectToParams";
import { IMeet } from "../../types/meet";

const getAuthorization = () => {
    // Getting user token and set to session storage
    try {
        const sessionStorageToken = sessionStorage.getItem("jwt-token") || null;
        const token = sessionStorageToken && sessionStorageToken;
        axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
    } catch (error) { }

};

const API_URL = process.env.NEXT_PUBLIC_API_URL + "meet";

class MeetService {
    constructor() {
        getAuthorization();
    }

    getInstantMeet = () => {
        return axios.get<MeetResponse>(`${API_URL}/create`);
    };

    addScheduleMeeting = (payload: any) => {
        return axios.post<MeetResponse>(`${API_URL}/schedule`, { ...payload });
    };

    reScheduleMeeting = (id: string, payload: IMeet) => {
        return axios.put<MeetResponse>(`${API_URL}/schedule/update_meet/${id}`, { ...payload });
    };

    joinMeet = (roomId: string, user_t?: string, token?: string) => {
        if (user_t) {
            return axios.get<MeetResponse>(`${API_URL}/join/${roomId}?user_t=${user_t}`);
        } else {
            return axios.get<MeetResponse>(`${API_URL}/join/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    };

    upcomingSchedule = (token?: string) => {
        if (token) {
            return axios.get<IMeet>(`${API_URL}/schedule/upcoming`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } else {
            return axios.get<IMeet>(`${API_URL}/schedule/upcoming`);
        }

    };

    previousSchedule = () => {
        return axios.get<IMeet>(`${API_URL}/schedule/previous`);
    };
    scheduleGetById = (id:string) => {
        return axios.get<IMeet>(`${API_URL}/schedule/single/${id}`);
    };
    removerInternalParticipant = (id:string, payload: any) => {
        return axios.put<IMeet>(`${API_URL}/schedule/remove_internal/${id}`,{ ...payload });
    }
    removerExternalParticipant = (id:string, payload: any) => {
        return axios.put<IMeet>(`${API_URL}/schedule/remove_external/${id}`,{ ...payload });
    }
    addInternalParticipant = (id:string, payload: any) => {
        return axios.put<IMeet>(`${API_URL}/schedule/add_internal/${id}`,{ ...payload });
    }
    addExternalParticipant = (id:string, payload: any) => {
        return axios.put<IMeet>(`${API_URL}/schedule/add_external/${id}`,{ ...payload });
    }
    getInternalParticipant = (id:string, search: string, limit: number, page: number) => {
        return axios.get<IMeet>(`${API_URL}/schedule/get_internal/${id}?limit=${limit}&page=${page}&search=${search}`);
    }
    getexternalParticipant = (id:string, search: string, limit: number, page: number) => {
        return axios.get<IMeet>(`${API_URL}/schedule/get_external/${id}?limit=${limit}&page=${page}&search=${search}`);
    }
    getHandRaisedInfo = (id:string) => {
        return axios.get<string[]>(`${API_URL}/hand/${id}`);
    }
    handRaise = (payload: any) => {
        return axios.put<IMeet>(`${API_URL}/hand`,{ ...payload });
    }

}
const meetService = new MeetService()
export default meetService;
