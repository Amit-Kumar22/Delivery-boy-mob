import Reactotron from "reactotron-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactotron = Reactotron.setAsyncStorageHandler!(AsyncStorage)
  .configure({
    name: "DeliveryBoy App",
  })
  .useReactNative({
    asyncStorage: true,
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: false,
    errors: { veto: (stackFrame) => false },
    overlay: false,
  })
  .connect();

export const logApiRequest = (
  method: string,
  url: string,
  data?: any,
) => {
  if (reactotron && reactotron.display) {
    reactotron.display({
      name: "API REQUEST",
      value: { method, url, data },
      preview: `${method} ${url}`,
      important: true,
    });
  }
};

export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  data: any,
) => {
  if (reactotron && reactotron.display) {
    reactotron.display({
      name: "API RESPONSE",
      value: { method, url, status, data },
      preview: `${method} ${url} - ${status}`,
      important: false,
    });
  }
};

export const logApiError = (
  method: string,
  url: string,
  status: number,
  error: any,
) => {
  if (reactotron && reactotron.display) {
    reactotron.display({
      name: "API ERROR",
      value: { method, url, status, error },
      preview: `${method} ${url} - ${status}`,
      important: true,
    });
  }
};

export default reactotron;
