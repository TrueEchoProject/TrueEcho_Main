package te.trueEcho.domain.notification.entity;


import jakarta.persistence.*;

@Entity
@DiscriminatorValue("service_notis")
public class ServiceNoti extends Notification{
}
