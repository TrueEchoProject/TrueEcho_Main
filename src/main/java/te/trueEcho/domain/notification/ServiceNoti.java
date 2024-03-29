package te.trueEcho.domain.notification;


import jakarta.persistence.*;

@Entity
@DiscriminatorValue("service_notis")
public class ServiceNoti extends Notification{
}
