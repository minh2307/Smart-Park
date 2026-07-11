create table analytics_dead_letter (
    id bigint not null auto_increment,
    event_id varchar(36) not null,
    payload TEXT not null,
    error_message TEXT,
    retry_count integer not null,
    failed_at datetime(6) not null,
    primary key (id)
) engine=InnoDB;

alter table analytics_dead_letter 
    add constraint UK_analytics_dead_letter_event_id unique (event_id);
