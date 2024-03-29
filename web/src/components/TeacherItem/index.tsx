import React from 'react';

import whatsappIcon from '../../assets/images/icons/whatsapp.svg';

import './styles.css';
import api from '../../services/api';

export interface Teacher {
    id: number
    avatar: string;
    bio: string;
    cost: number;
    name: string;
    subject: string;
    whatsapp: string;
}
interface TeacherItemProps {
    teacher: Teacher;
}

const TeacherItem: React.FC<TeacherItemProps> = ({ teacher }) => {
    function handleCreateConnection() {
        api.post('connections', {
            user_id: teacher.id,
        });
    }

    return (
        <div>
            <article className="teacher-item">
                <header>
                    <img src={teacher.avatar} alt={teacher.name}/>
                    <div>
                        <strong>{teacher.name}</strong>
                        <span>{teacher.subject}</span>
                    </div>
                </header>

                <p>{teacher.bio}</p>

                <footer>
                    <p>
                        Preço/hora
                        <strong>R$ {teacher.cost}</strong>
                    </p>
                    <a target="_blank" onClick={handleCreateConnection} href={`https://wa.me/${teacher.whatsapp}`}>
                        <img src={whatsappIcon} alt="Entrar em contato"/>
                        Entrar em contato
                    </a>
                </footer>
            </article>
        </div>
    );
}

export default TeacherItem;