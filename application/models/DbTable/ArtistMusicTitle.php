<?php

/**
 * DbTable_ArtistMusicTitle
 *
 * @package Amuzi
 * @version 1.0
 * Amuzi - Online music
 * Copyright (C) 2010-2012  Diogo Oliveira de Melo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
class DbTable_ArtistMusicTitle extends DZend_Db_Table
{
    public function insert($data)
    {
        return $this->insertCachedWithoutException($data);
    }

    public function fetchAllArtistAndMusicTitle($idsList)
    {
        $db = $this->getAdapter();
        $select = $db->select();
        $select->from(
            array('amt' => 'artist_music_title'),
            array('artistMusicTitleId' => 'id')
        )->join(
            array('a' => 'artist'),
            'a.id = amt.artist_id',
            array('artist' => 'name')
        )->join(
            array('m' => 'music_title'),
            'm.id = amt.music_title_id',
            array('musicTitle' => 'name')
        )->where('amt.id in ( ' . implode(', ', $idsList) . ')');

        return $db->fetchAll($select);
    }

    /**
     * autocomplete Search on database for rows that fits the query.
     *
     * @param mixed $q
     * @param int $limit
     * @return Zend_Db_Table_RowSet
     */
    public function autocomplete($q, $limit = 10)
    {
        $db = $this->getAdapter();
        $select = $db->select();
        $select->from(
            array('a' => 'artist'),
            array(
                'name' => 'concat(a.name, " - ", mt.name)',
                'cover' => 't.cover',
                'artist' => 'name',
                'musicTitle' => 'mt.name'
                )
        )->join(
            array('amt' => 'artist_music_title'),
            'amt.artist_id = a.id',
            array()
        )->join(
            array('mt' => 'music_title'),
            'mt.id = amt.music_title_id',
            array()
        )->join(
            array('mtl' => 'music_track_link'),
            'mtl.artist_music_title_id = amt.id',
            array()
        )->join(array('t' => 'track'), 't.id = mtl.track_id', array())
        ->where('concat(a.name, " - ", mt.name) like ?', '%' . $q . '%')
        ->group('amt.id')
        ->limit($limit);

        $this->_logger->debug("-----> select: " . $select);
        return $db->fetchAll($select);
    }
}
