import Joi from "joi";

const timeRegex = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/;

export const createShiftDto = Joi.object({
  name: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.string().regex(timeRegex).required(),
  endTime: Joi.string()
    .regex(timeRegex)
    .custom((value, helpers) => {
      const { startTime } = helpers.state.ancestors[0];
      // Convert startTime and endTime to comparable values
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = value.split(":").map(Number);

      if (
        endHour < startHour ||
        (endHour === startHour && endMinute <= startMinute)
      ) {
        throw new Error('"endTime" must be greater than "startTime"');
      }

      return value;
    })
    .required(),
});

export const updateShiftDto = Joi.object({
  name: Joi.string(),
  date: Joi.date(),
  startTime: Joi.string().regex(timeRegex),
  endTime: Joi.string().regex(timeRegex),
});

export const publishShiftDto = Joi.object({
  week: Joi.number()
    .required()
    .description("Week number within the year that wants to be published"),
});
