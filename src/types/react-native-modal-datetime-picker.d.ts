// Temporary module declaration to satisfy TypeScript until the
// package 'react-native-modal-datetime-picker' is installed with types.
declare module 'react-native-modal-datetime-picker' {
  import { ComponentType } from 'react';

  export interface ReactNativeModalDateTimePickerProps {
    isVisible: boolean;
    mode?: 'date' | 'time' | 'datetime';
    onConfirm: (date: Date) => void;
    onCancel: () => void;
    // allow other props
    [key: string]: any;
  }

  const DateTimePickerModal: ComponentType<ReactNativeModalDateTimePickerProps>;
  export default DateTimePickerModal;
}
