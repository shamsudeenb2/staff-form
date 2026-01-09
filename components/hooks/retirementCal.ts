/**
 * Interface for the result object, 
 * useful if you want to use the numbers elsewhere in your UI.
 */
interface RetirementRemaining {
  years: number;
  months: number;
  message: string;
}

/**
 * Calculates the time remaining until retirement.
 * Criteria: 60 years of age OR 35 years of service (whichever comes first).
 */
export function getRetirementTimeLeft(
  dateOfBirth: Date|string, 
  dateOfAppointment: string | Date
): string | RetirementRemaining {
  
if(dateOfBirth=== undefined && dateOfAppointment===undefined){
    return "—"
}

if(dateOfBirth=== null && dateOfAppointment===null){
    return "—"
}
  const today: Date = new Date();
  const dob: Date = new Date(dateOfBirth);
  const doa: Date = new Date(dateOfAppointment);

  // 1. Calculate Retirement by Age (60 years)
  const retireByAge: Date = new Date(dob);
  retireByAge.setFullYear(dob.getFullYear() + 60);

  // 2. Calculate Retirement by Service (35 years)
  const retireByService: Date = new Date(doa);
  retireByService.setFullYear(doa.getFullYear() + 35);

  // 3. Determine the actual retirement date (the earlier of the two)
  const actualRetirementDate: Date = retireByAge < retireByService ? retireByAge : retireByService;

  // 4. Check if the staff has already retired
  if (actualRetirementDate <= today) {
    return "The staff is due for retirement or has already retired.";
  }

  // 5. Calculate years and months difference
  let years: number = actualRetirementDate.getFullYear() - today.getFullYear();
  let months: number = actualRetirementDate.getMonth() - today.getMonth();

  // Adjust if the month difference is negative
  if (months < 0) {
    years--;
    months += 12;
  }

  // Formatting strings
  const yearLabel: string = years === 1 ? "year" : "years";
  const monthLabel: string = months === 1 ? "month" : "months";

  return `${years} ${yearLabel}, ${months} ${monthLabel}.`;
}

// --- Example Usage ---
const dob: string = "1975-05-20";
const doa: string = "2000-10-10";

const timeLeft = getRetirementTimeLeft(dob, doa);
console.log(timeLeft);