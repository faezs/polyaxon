from django.conf import settings

from constants import stores
from libs.paths.data_paths import validate_persistence_data
from libs.paths.exceptions import VolumeNotFoundError
from libs.paths.outputs_paths import validate_persistence_outputs


def get_store_secret_from_definition(volume_name, volume_settings):
    if volume_name not in volume_settings:
        raise VolumeNotFoundError('Volume with name `{}` was defined in specification, '
                                  'but was not found'.format(volume_name))

    definition = volume_settings[volume_name]
    store = definition.get('store')
    secret = definition.get('secret')
    secret_key = definition.get('secretKey')

    if store:
        if store not in stores.VALUES:
            raise VolumeNotFoundError(
                'Volume with store class `{}` is not supported.'.format(store))

        if not secret:
            raise VolumeNotFoundError(
                'Volume with store class `{}` does not define a secret.'.format(store))

        if not secret_key:
            raise VolumeNotFoundError(
                'Volume with store class `{}` does not define a secretKey.'.format(store))

    return store, secret, secret_key


def get_data_store_secrets(persistence_data, data_paths):
    persistence_data = validate_persistence_data(persistence_data=persistence_data)
    secrets = set([])
    secret_keys = {}
    for persistence_name in persistence_data:
        store, persistence_secret, persistence_secret_key = get_store_secret_from_definition(
            volume_name=persistence_name,
            volume_settings=settings.PERSISTENCE_DATA)
        if persistence_secret and persistence_secret_key and persistence_name in data_paths:
            secrets.add((persistence_secret, persistence_secret_key))
            secret_keys[data_paths[persistence_name]] = {
                'store': store,
                'secret_key': persistence_secret_key
            }
    return secrets, secret_keys


def get_outputs_store_secrets(persistence_outputs, outputs_path):
    persistence_outputs = validate_persistence_outputs(persistence_outputs=persistence_outputs)
    secrets = set([])
    secret_keys = {}

    store, persistence_secret, persistence_secret_key = get_store_secret_from_definition(
        volume_name=persistence_outputs,
        volume_settings=settings.PERSISTENCE_OUTPUTS)

    if persistence_secret and persistence_secret_key:
        secrets.add((persistence_secret, persistence_secret_key))
        secret_keys[outputs_path] = {'store': store, 'secret_key': persistence_secret_key}
    return secrets, secret_keys


def get_outputs_refs_store_secrets(specs):
    secrets = set([])
    secret_keys = {}
    if not specs:
        return secrets, secret_keys

    for spec in specs:
        store, persistence_secret, persistence_secret_key = get_store_secret_from_definition(
            volume_name=spec.persistence,
            volume_settings=settings.PERSISTENCE_OUTPUTS)
        if persistence_secret and persistence_secret_key:
            secrets.add((persistence_secret, persistence_secret_key))
            secret_keys[spec.path] = {'store': store, 'secret_key': persistence_secret_key}

    return secrets, secret_keys
