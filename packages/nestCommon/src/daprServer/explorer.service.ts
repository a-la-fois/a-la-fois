import { Injectable } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DAPR_INVOKE_SUBSCRIBER } from './constants';
import { DaprInvokeMetadataConfiguration } from './types';

@Injectable()
export class ExplorerService {
    private readonly metadataScanner = new MetadataScanner();

    constructor(private readonly modulesContainer: ModulesContainer) {}

    public explore(): DaprInvokeMetadataConfiguration[] {
        // find all the controllers
        const modules = [...this.modulesContainer.values()];
        const controllersMap = modules
            .filter(({ controllers }) => controllers.size > 0)
            .map(({ controllers }) => controllers);

        // munge the instance wrappers into a nice format
        const instanceWrappers: InstanceWrapper<Controller>[] = [];
        controllersMap.forEach((map) => {
            const mapKeys = [...map.keys()];

            instanceWrappers.push(
                // @ts-ignore
                ...mapKeys.map((key) => {
                    return map.get(key);
                })
            );
        });

        // @ts-ignore
        return instanceWrappers
            .map(({ instance }) => {
                const instancePrototype = Object.getPrototypeOf(instance);

                return this.metadataScanner.scanFromPrototype(instance, instancePrototype, (method) => {
                    return this.exploreMethodMetadata(instance, instancePrototype, method);
                });
            })
            .reduce((prev, curr) => {
                return prev.concat(curr);
            });
    }

    public exploreMethodMetadata(
        instance: object,
        instancePrototype: Controller,
        methodKey: string
    ): DaprInvokeMetadataConfiguration | null {
        const targetCallback = instancePrototype[methodKey];
        const handler = Reflect.getMetadata(DAPR_INVOKE_SUBSCRIBER, targetCallback);

        if (!handler) {
            return null;
        }

        return {
            ...handler,
            callback: targetCallback.bind(instance),
        };
    }
}
