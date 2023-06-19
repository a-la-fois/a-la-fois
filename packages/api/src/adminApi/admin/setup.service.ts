import { Injectable } from '@nestjs/common';
import { AdminService } from './admin.service';
import { devCanvasId, devCodeEditorId, devCodeEditorPrivateId, devConsumerId } from './constants';

@Injectable()
export class SetupService {
    constructor(private adminService: AdminService) {}

    async devSetup() {
        const consumer = await this.setupConsumer();
        const editorDoc = await this.setupDoc(devCodeEditorId, true);
        const editorPrivateDoc = await this.setupDoc(devCodeEditorPrivateId);
        const canvasDoc = await this.setupDoc(devCanvasId, true);

        return {
            consumer,
            editorDoc: {
                id: editorDoc.id,
            },
            canvasDoc: {
                id: canvasDoc.id,
            },
            editorPrivateDoc: {
                id: editorPrivateDoc.id,
            },
        };
    }

    private async setupConsumer() {
        try {
            const result = await this.adminService.createConsumerWithKey({ name: 'dev', id: devConsumerId });

            return {
                id: result.consumer.id,
                name: result.consumer.name,
                privateKey: result.privateKey,
            };
        } catch (_err) {
            const result = await this.adminService.regenerateKeys(devConsumerId);

            return {
                id: result.consumer.id,
                name: result.consumer.name,
                privateKey: result.privateKey,
            };
        }
    }

    private setupDoc = async (id: string, isPublic = false) => {
        try {
            const doc = isPublic
                ? await this.adminService.createPublicDoc(id)
                : await this.adminService.createPrivateDoc(devConsumerId, id);

            return {
                id: doc.id,
            };
        } catch (_err) {
            console.log(_err);
            return {
                id,
            };
        }
    };
}
