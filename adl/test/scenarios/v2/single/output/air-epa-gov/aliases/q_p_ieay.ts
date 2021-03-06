
/** Years (1 to 5) Range.  This value is used to create a date range for Informal Enforcement Actions (IEA). Used along with p_iea (which indicates whether to look within or outside of the date range) to find IEAs within (or not within) the number of years specified. */
export type q_p_ieay = Query<1 | 2 | 3 | 4 | 5, "p_ieay">;
