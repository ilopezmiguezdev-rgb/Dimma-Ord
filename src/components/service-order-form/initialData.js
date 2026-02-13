export const getInitialData = () => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - timezoneOffset);
    const formattedDate = localDate.toISOString().split('T')[0];

    return {
        id: null,
        client_id: '',
        clientName: '',
        sub_client_id: null,
        sub_client_name: '',
        clientContact: '',
        clientLocation: '',
        equipment_id: null,
        equipmentType: '',
        equipmentBrand: '',
        equipmentModel: '',
        equipmentSerial: '',
        reportedIssue: '',
        workSummary: '',
        taskTime: '',
        partsUsed: [],
        laborHours: '',
        laborRate: '',
        transportCost: '',
        partsCost: 0,
        laborCost: 0,
        totalCost: 0,
        status: 'Pendiente',
        order_type: 'Service',
        assigned_technician: 'Dimma',
        creation_date: formattedDate,
        dateReceived: formattedDate,
        dateCompleted: null,
    };
};