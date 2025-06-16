// src/shift/dto/create-shift.dto.ts
export class CreateShiftDto {
  name: string;
  startTime: string; // Định dạng 'HH:mm:ss'
  endTime: string; // Định dạng 'HH:mm:ss'
}

// src/shift/dto/update-shift.dto.ts
export class UpdateShiftDto {
  name?: string;
  startTime?: string; // Định dạng 'HH:mm:ss'
  endTime?: string; // Định dạng 'HH:mm:ss'
}
