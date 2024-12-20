import { StatusCodes } from "http-status-codes";
import {
  Equal,
  type FindManyOptions,
  type FindOneOptions,
  LessThan,
  MoreThanOrEqual,
  Raw,
} from "typeorm";
import Shift from "../database/default/entity/shift";
import * as shiftRepository from "../database/default/repository/shiftRepository";
import { HttpError } from "../shared/classes/HttpError";
import type { ICreateShift, ITime, IUpdateShift } from "../shared/interfaces";

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>,
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  await isTimeAvailable(payload);

  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;

  return shiftRepository.create(shift);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift,
): Promise<Shift> => {
  // check if any time fields are missing
  const isTimeFieldMissing =
    !payload.date || !payload.startTime || !payload.endTime;
  // if any time fields are missing, get the old shift data
  // it will prevent unnecessary db calls when updates all time fields
  const oldShift = isTimeFieldMissing ? await findById(id) : null;

  await isTimeAvailable({
    startTime: payload.startTime ?? oldShift.startTime,
    endTime: payload.endTime ?? oldShift.endTime,
    date: payload.date ?? oldShift.date,
  });

  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};

export const isTimeAvailable = async ({ startTime, endTime, date }: ITime) => {
  const check = await shiftRepository.find({
    select: ["startTime", "endTime"],
    where: {
      startTime: LessThan(endTime),
      endTime: MoreThanOrEqual(startTime),
      date: Equal(date),
    },
  });

  if (check.length > 0) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      "Timeslot is not available, please choose another time",
    );
  }
};

export const publish = async (week: number) => {
  return shiftRepository.update(
    {
      date: Raw((alias) => `DATE_PART('week', ${alias}) = ${week}`),
    },
    {
      published: true,
    },
  );
};
