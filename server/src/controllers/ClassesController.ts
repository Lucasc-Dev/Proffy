import { Request, Response } from 'express';

import db from '../database/connection';

import convertHourToMinutes from '../utils/ConvertHourToMinutes';

interface ScheduleItem {
    week_day: string;
    from: string;
    to: string;
}

export default class ClassesController {
    async index(req: Request, res: Response) {
        const filters = req.query;

        const week_day = filters.week_day as string;
        const subject = filters.subject as string;
        const time = filters.time as string;

        if (!week_day || !subject || !time) {
            return res.status(400).json({
                error: 'Missing filters to search classes.',
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return res.json(classes);
    }

    async create(req: Request, res: Response) {
        const { 
            name, 
            avatar, 
            whatsapp, 
            bio, 
            subject, 
            cost, 
            schedule,
        } = req.body;
        
        const trx = await db.transaction();
    
        try {
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });
        
            const user_id = insertedUsersIds[0];
        
            const insertedClassesIds = await trx('classes').insert({
                user_id,
                subject,
                cost,
            });
        
            const class_id = insertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => ({
                class_id,
                week_day: scheduleItem.week_day,
                from: convertHourToMinutes(scheduleItem.from),
                to: convertHourToMinutes(scheduleItem.to),
            }));
        
            await trx('class_schedule').insert(classSchedule);
        
            await trx.commit();
            
            return res.status(201).send();
        } catch (error) {
            await trx.rollback();
    
            return res.status(400).json({
                error: 'Unexpected error while creating new class.',
            });
        }
    }
}